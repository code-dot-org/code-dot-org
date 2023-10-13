import HttpClient from '@cdo/apps/util/HttpClient';
import {CHAT_COMPLETION_URL} from '@cdo/apps/aichat/constants';

const doAi = async (input: string) => {
  const oldDanceBackgroundEffects =
    'circles, color_cycle, diamonds, disco_ball, fireworks, swirl, kaleidoscope, lasers, splatter, rainbow, snowflakes, galaxy, sparkles, spiral, disco, stars';
  const newDanceBackgroundEffects =
    'starburst, blooming_petals, frosted_grid, clouds';
  const allDanceBackgroundEffects = `${oldDanceBackgroundEffects}, ${newDanceBackgroundEffects}`;
  const poetryBackgroundColors =
    'grayscale, sky, ocean, sunrise, sunset, spring, summer, autumn, winter, twinkling, rainbow, roses';
  const oldDanceBackgroundColors =
    'rave, cool, electronic, iceCream, neon, tropical, vintage, warm';
  const allDanceBackgroundColors = `${poetryBackgroundColors}, ${oldDanceBackgroundColors}`;

  const danceForegroundEffects =
    'bubbles, confetti, hearts_red, music_notes, pineapples, pizzas, smiling_poop, rain, floating_rainbows, smile_face, spotlight, color_lights, raining_tacos';
  const danceExampleJson =
    '{backgroundColor: "roses", backgroundEffect: "starburst", foregroundEffect: "rain"}';
  const numWords = 20;
  const systemPrompt = `You are a helper which can accept a request for a mood or atmosphere, and you then generate JSON like the following format: ${danceExampleJson}.  The only valid values for backgroundEffect are ${allDanceBackgroundEffects}. The only valid values for backgroundColor are ${allDanceBackgroundColors}. The only valid values for foregroundEffect are ${danceForegroundEffects}. Make sure you always generate all three of these values.  Also, add a field called "explanation" to the result JSON, which contains a simple explanation of why you chose the values that you did, at the reading level of a 5th-grade school student, in one sentence of less than ${numWords} words.`;
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
