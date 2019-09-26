export const CANVAS_WIDTH = 200;
export const CANVAS_HEIGHT = 200;
export const CANVAS_BG_COLOR = [243, 243, 243];

const CENTER_X = CANVAS_WIDTH / 2;

export const generateGoodCreature = () => {
  return {
    eyes: generateEyes()
  };
};

export const generateBadCreature = () => {
  return {
    eyes: generateEyes()
  };
};

const generateEyes = () => {
  const eyeSize = randomInt(20, 50);
  const leftEyeX = randomInt(eyeSize, CENTER_X - eyeSize);
  const rightEyeX = CANVAS_WIDTH - (CENTER_X - leftEyeX);
  const yPos = randomInt(eyeSize, CANVAS_HEIGHT / 2 - eyeSize);

  return [[leftEyeX, yPos, eyeSize], [rightEyeX, yPos, eyeSize]];
};

const randomInt = (min, max) => {
  return Math.floor(Math.random() * Math.floor(max + 1));
};
