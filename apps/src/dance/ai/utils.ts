import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from '@cdo/apps/aichat/constants';
import {
  COMMON_DANCE_BACKGROUND_EFFECTS,
  EXTRA_AI_DANCE_BACKGROUND_EFFECTS,
  COMMON_DANCE_COLOR_PALETTES,
  POETRY_COLOR_PALETTES,
  DANCE_FOREGROUND_EFFECTS,
} from '@cdo/apps/dance/constants';

const doAi = async (input: string) => {
  const danceBackgroundEffects = `${COMMON_DANCE_BACKGROUND_EFFECTS.join(
    ', '
  )}, ${EXTRA_AI_DANCE_BACKGROUND_EFFECTS.join(', ')}`;
  const danceBackgroundColors = `${COMMON_DANCE_COLOR_PALETTES.join(
    ', '
  )}, ${POETRY_COLOR_PALETTES.join(', ')}`;
  const danceExampleJson =
    '{backgroundColor: "vintage", backgroundEffect: "diamonds", foregroundEffect: "hearts_red"}';
  const numWords = 40;
  const systemPrompt = `You are a helper which can accept a request for a mood or atmosphere, and you then generate JSON like the following format: ${danceExampleJson}.  The only valid values for backgroundEffect are ${danceBackgroundEffects}. The only valid values for backgroundColor are ${danceBackgroundColors}. The only valid values for foregroundEffect are ${DANCE_FOREGROUND_EFFECTS}. Make sure you always generate all three of these values.  Also, add a field called "explanation" to the result JSON, which contains a simple explanation of why you chose the values that you did, at the reading level of a 5th-grade school student, in one sentence of less than ${numWords} words.`;
  console.log('systemPrompt', systemPrompt);
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: input,
    },
  ];

  console.log('do AI:', input);

  const response = await HttpClient.post(
    CHAT_COMPLETION_URL,
    JSON.stringify({messages}),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  );

  if (response.status === 200) {
    const res = await response.json();
    return res.content;
  } else {
    return null;
  }
};

export {doAi};
