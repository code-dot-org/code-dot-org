/* globals appOptions */

export const openaiCompletion = messages => {
  console.log('messages', messages);
  return $.ajax({
    url: '/openai/chat_completion',
    method: 'POST',
    data: JSON.stringify({messages}),
    contentType: 'application/json',
    headers: {
      'X-CSRF-Token': appOptions.authenticityToken,
    },
    dataType: 'json',
  });
};
