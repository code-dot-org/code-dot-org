/* globals appOptions */

export const openaiCompletion = messages => {
    console.log('messages in openaiCompletion', messages);
    console.log("appOptions.authenticityToken", appOptions.authenticityToken)
    return $.ajax({
      url: '/openai/chat_completion',
      method: 'POST',
      data: JSON.stringify({messages}),
      contentType: 'application/json',
      headers: {
        'X-CSRF-Token': appOptions.authenticityToken
      },
      dataType: 'json'
    });
  };