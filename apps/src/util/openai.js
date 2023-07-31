import $ from 'jquery';
import {getAuthenticityToken} from './AuthenticityTokenStore';

// get message input from user
// append to conversation to send to openAI
// get response from openAI and append to conversation

export const openaiCompletion = async messages => {
  const token = await getAuthenticityToken();
  console.log('messages', messages);

  return $.ajax({
    url: '/openai/chat_completion',
    method: 'POST',
    data: JSON.stringify({messages}),
    contentType: 'application/json',
    headers: {
      'X-CSRF-Token': token,
    },
    dataType: 'json',
  });
};
