import $ from 'jquery';

export const findProfanity = (text, language = null) => {
  return $.ajax({
    url: '/profanity/find',
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify({text, language})
  });
};
