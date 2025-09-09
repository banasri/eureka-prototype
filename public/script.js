document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Get all selected interests
  const interests = [];
  form.querySelectorAll('input[name="interests"]:checked').forEach(checkbox => {
    interests.push(checkbox.value);
  });
  data.interests = interests;

  // Simple validation
  if (!data.name || !data.mobile) {
    document.getElementById('message').textContent = 'Please fill out all required fields.';
    return;
  }
  console.log('Submitting data:', JSON.stringify(data));
  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (result.success) {
      document.getElementById('message').textContent = `Registration successful! Your user ID is: ${result.userId}`;
      form.reset();
    } else {
      document.getElementById('message').textContent = 'Registration failed: ' + result.error;
    }
  } catch (error) {
    document.getElementById('message').textContent = 'An error occurred. Please try again later.';
    console.error('Error:', error);
  }
});