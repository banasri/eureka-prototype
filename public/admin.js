async function login() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;

  // Store credentials in localStorage
  localStorage.setItem('adminUsername', username);
  localStorage.setItem('adminPassword', password);

  await fetchUsers();
}

function checkLoginStatus() {
  const username = localStorage.getItem('adminUsername');
  const password = localStorage.getItem('adminPassword');
  if (username && password) {
    // If credentials exist, try to fetch users
    fetchUsers();
  } else {
    // Show login form if no credentials found
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('dashboardContent').style.display = 'none';
  }
}

async function fetchUsers() {
  const username = localStorage.getItem('adminUsername');
  const password = localStorage.getItem('adminPassword');

  if (!username || !password) {
    alert('Please log in first.');
    logout();
    return;
  }

  const locationFilter = document.getElementById('locationFilter').value.toLowerCase();
  const interestFilter = document.getElementById('interestFilter').value.toLowerCase();

  try {
    const response = await fetch(`/admin/users?username=${username}&password=${password}`);

    if (response.status === 401) {
      alert('Invalid credentials. Logging out.');
      logout();
      return;
    }

    const users = await response.json();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('dashboardContent').style.display = 'block';

    const filteredUsers = users.filter(user => {
      const matchesLocation = locationFilter ? user.location.toLowerCase().includes(locationFilter) : true;
      const matchesInterest = interestFilter ? user.interests.toLowerCase().includes(interestFilter) : true;
      return matchesLocation && matchesInterest;
    });

    renderUsers(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Could not connect to the server.');
  }
}

function logout() {
  localStorage.removeItem('adminUsername');
  localStorage.removeItem('adminPassword');
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('dashboardContent').style.display = 'none';
}

function renderUsers(users) {
  const tableBody = document.getElementById('userTableBody');
  tableBody.innerHTML = '';

  users.forEach(user => {
    let otherInterests = user.otherInterests || '';
    const row = tableBody.insertRow();
    const interests = JSON.parse(user.interests).join(', ') + (otherInterests ? (', ' + otherInterests) : '');

    row.innerHTML = `
            <td>${user.userId}</td>
            <td>${user.name}</td>
            <td>${user.location}</td>
            <td>${interests}</td>
            <td>${user.isVerified ? '✅' : '❌'}</td>
            <td>
               ${user.isVerified
        ? '<button style="background-color: #02bb0be8;">Verified</button>'
        : `<button style="width: 77px;" onclick="verifyUser('${user.userId}')">Verify</button>`
      }
                
            </td>
            <td>${user.adminRemarks || ''}</td>
        `;
  });
}

async function verifyUser(userId) {
  const remarks = prompt('Enter admin remarks:');
  if (remarks === null) return;

  try {
    const response = await fetch('/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, remarks })
    });
    const result = await response.json();
    if (result.success) {
      alert('User verified successfully!');
      fetchUsers(); // Refresh the list
    } else {
      alert('Failed to verify user.');
    }
  } catch (error) {
    console.error('Error verifying user:', error);
    alert('An error occurred.');
  }
}

// Initial check on page load
window.onload = checkLoginStatus;