/* globals appOptions */

export const openaiCompletion = prompt => {
  return $.ajax({
    url: '/openai/chat_completion',
    method: 'POST',
    data: {prompt},
    headers: {
      'X-CSRF-Token': appOptions.authenticityToken
    }
  });
};
