export const openaiCompletion = messages => {
  console.log('messages', messages); // messages is an array of objects - each object has keys: role and comment.
  // add check to make sure messages is formatted correctly.
  return $.ajax({
    url: '/openai/chat_completion',
    method: 'POST',
    data: JSON.stringify({messages}), //
    contentType: 'application/json',
    headers: {
      'X-CSRF-Token': appOptions.authenticityToken,
    },
    dataType: 'json',
  });
};
