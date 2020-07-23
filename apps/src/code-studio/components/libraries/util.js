import $ from 'jquery';

export const findProfanity = (text, language, shouldCache) => {
  return $.ajax({
    url: '/profanity/find',
    method: 'POST',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify({text, language, should_cache: shouldCache})
  });
};
