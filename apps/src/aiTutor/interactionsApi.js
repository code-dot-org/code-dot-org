export async function savePromptAndResponse() {
  console.log('savePromptAndResponse was called');

  // Checking that the csrf-token exists since it is disabled on test
  const csrfToken = document.querySelector('meta[name="csrf-token"]')
    ? document.querySelector('meta[name="csrf-token"]').attributes['content']
        .value
    : null;

  const interactionData = {
    prompt: 'is this working?',
  };

  try {
    let response = await fetch('/ai_tutor_interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      body: JSON.stringify(interactionData),
    });
    let data = await response.json();
    console.log('data', data);
  } catch (err) {
    console.error('Error saving chat messages' + err);
  }
}
