import {getAuthenticityToken} from '../util/AuthenticityTokenStore';

export async function savePromptAndResponse(interactionData) {
  try {
    let response = await fetch('/ai_tutor_interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': await getAuthenticityToken(),
      },
      body: JSON.stringify(interactionData),
    });
    let data = await response.json();
    console.log('data', data);
  } catch (err) {
    console.error('Error saving chat messages' + err);
  }
}
