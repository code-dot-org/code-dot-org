/**
 * CONSTANTS
 */
const CANVAS_WIDTH = 400;
const CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_HEIGHT = 400;
const CENTER_Y = CANVAS_WIDTH / 2;
const CANVAS_BG_COLOR = [243, 243, 243];

const MIN_BODY_SIZE = 100;
const MIN_EYE_SIZE = 20;
const MOUTH_TO_EYE_DISTANCE = 20;
const MIN_MOUTH_SIZE = 5;
const MAX_MOUTH_SIZE = 80;

/**
 * TYPES
 */
export const CreatureType = Object.freeze({
  None: 0,
  Good: 1,
  Bad: 2
});

const BodyShape = Object.freeze({
  None: 0,
  Rect: 1,
  Ellipse: 2
});

/**
 * P5
 */
const sketch = p5 => {
  let eyes, drawBody, drawMouth;

  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    p5.background(CANVAS_BG_COLOR);
  };

  const draw = () => {
    p5.clear();
    p5.background(CANVAS_BG_COLOR);

    if (drawBody) {
      drawBody();
    }

    if (drawMouth) {
      drawMouth();
    }

    (eyes || []).forEach(drawEye);
  };

  // Draws an eye with a pupil given an eye, represented as follows: [xPos, yPos, size]
  const drawEye = eye => {
    // outer eye
    p5.fill(255, 255, 255);
    p5.ellipse(...eye);

    // pupil
    let pupil = [...eye];
    pupil[2] /= 10;
    p5.fill(0, 0, 0);
    p5.ellipse(...pupil);
  };

  p5.setCreature = type => {
    const bodyShape = bodyShapeFor(type);

    let body = {
      width: randomInt(MIN_BODY_SIZE, CANVAS_WIDTH / 2),
      height: randomInt(MIN_BODY_SIZE, CANVAS_HEIGHT / 2)
    };

    if (bodyShape === BodyShape.Rect) {
      body.minX = Math.floor((CANVAS_WIDTH - body.width) / 2);
      body.minY = Math.floor((CANVAS_HEIGHT - body.height) / 2);
    } else if (bodyShape === BodyShape.Ellipse) {
      body.minX = CENTER_X - body.width / 2;
      body.minY = CENTER_Y - body.height / 2;
    }

    drawBody = () => {
      p5.fill(randomInt(0, 255), randomInt(0, 255), randomInt(0, 255));

      if (bodyShape === BodyShape.Rect) {
        p5.rect(body.minX, body.minY, body.width, body.height, 10);
      } else if (bodyShape === BodyShape.Ellipse) {
        p5.ellipse(CENTER_X, CENTER_Y, body.width, body.height);
      }
    };

    // TODO: (madelynkasula) Make eye positioning more accurate for ellipse bodies.
    const eyeSize = randomInt(MIN_EYE_SIZE, body.width / 2);
    const leftEyeXPos = randomInt(body.minX, CENTER_X - eyeSize / 2);
    const rightEyeXPos = CENTER_X + (CENTER_X - leftEyeXPos);
    const eyeYPos = randomInt(body.minY, body.minY + body.height / 2);
    eyes = [[leftEyeXPos, eyeYPos, eyeSize], [rightEyeXPos, eyeYPos, eyeSize]];

    drawMouth = () => {
      const mouthW = randomInt(MIN_MOUTH_SIZE, MAX_MOUTH_SIZE);
      const mouthH = randomInt(MIN_MOUTH_SIZE, MAX_MOUTH_SIZE);
      const yPos = eyeYPos + eyeSize / 2 + MOUTH_TO_EYE_DISTANCE;
      p5.noFill();

      if (type === CreatureType.Good) {
        // smile
        p5.arc(CENTER_X, yPos, mouthW, mouthH, 0, Math.PI);
      } else if (type === CreatureType.Bad) {
        // frown
        p5.arc(CENTER_X, yPos, mouthW, mouthH, Math.PI, 2 * Math.PI);
      }
    };

    draw();
  };

  p5.download = canvasId => {
    p5.saveCanvas(canvasId, "png");
  };
};

export default sketch;

/**
 * HELPER FUNCTIONS
 */
const randomInt = (min, max) => {
  return Math.floor(Math.random() * Math.floor(max + 1 - min) + min);
};

const bodyShapeFor = creatureType => {
  if (creatureType === CreatureType.Good) {
    return BodyShape.Rect;
  } else if (creatureType === CreatureType.Bad) {
    return BodyShape.Ellipse;
  } else {
    console.error("Unknown CreatureType!");
    return BodyShape.None;
  }
};
