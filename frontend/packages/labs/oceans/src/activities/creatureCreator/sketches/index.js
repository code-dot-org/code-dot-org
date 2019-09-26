/**
 * CONSTANTS
 */
const CANVAS_WIDTH = 200;
const CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_HEIGHT = 200;
const CANVAS_BG_COLOR = [243, 243, 243];

/**
 * P5
 */
const sketch = p5 => {
  let eyes;

  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.background(CANVAS_BG_COLOR);
  };

  const draw = () => {
    p5.background(CANVAS_BG_COLOR);

    (eyes || []).forEach(eye => {
      // outer eye
      p5.fill(255, 255, 255);
      p5.ellipse(...eye);

      // pupil
      let pupil = [...eye];
      pupil[2] /= 10;
      p5.fill(0, 0, 0);
      p5.ellipse(...pupil);
    });
  };

  p5.setCreature = type => {
    p5.clear();
    eyes = generateEyes();
    draw();
  };
};

export default sketch;

/**
 * HELPER FUNCTIONS
 */
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
