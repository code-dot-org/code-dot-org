import {queryParams} from '@cdo/apps/code-studio/utils';

const SYSTEM_PROMPT = '';

export const openaiCompletion = prompt => {
  const key = queryParams('key');
  return $.ajax({
    url: 'https://api.openai.com/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`
    },
    data: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: [
        {role: 'system', content: SYSTEM_PROMPT},
        {role: 'user', content: prompt}
      ]
    })
  }).then(response => response.choices[0].message.content);
};
