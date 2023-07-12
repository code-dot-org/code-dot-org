export const openaiCompletion = messages => {
  console.log('messages', messages);
  return $.ajax({
    url: '/api/aichat',
    method: 'POST',
    data: JSON.stringify({messages}),
    contentType: 'application/json',
    headers: {
      'X-CSRF-Token': appOptions.authenticityToken,
    },
    dataType: 'json',
  });
};
