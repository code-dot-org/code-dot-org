import {COLORS} from '../colors';
import _ from 'lodash';

/**
 * CONSTANTS
 */
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const BG_COLOR = '#021a61';
const BODY_CENTER_X = CANVAS_WIDTH / 2;
const BODY_CENTER_Y = CANVAS_HEIGHT / 2;

/**
 * TYPES
 */
export const EyeType = Object.freeze({
  Circle: 1,
  SemiCircleUp: 2,
  SemiCircleDown: 3
});

/**
 * P5
 */
export const sketch = p5 => {
  let fish = {
    body: {
      width: CANVAS_WIDTH / 2,
      height: CANVAS_WIDTH / 6,
      color: '#DC1C4B'
    },
    fins: {
      color: '#87D1EE',
      tail: {
        widthPercent: 0.03,
        heightPercent: 0.2
      },
      topFin: {
        widthPercent: 0.3,
        heightPercent: 0.1
      },
      sideFin: {
        widthPercent: 0.1,
        heightPercent: 0.3
      }
    },
    eyes: {
      type: EyeType.Circle,
      xOffsetRatio: 0.7,
      yOffsetRatio: 0.25,
      diameter: 25,
      pupilDiameter: 5
    },
    mouth: {
      teeth: {
        num: 5,
        height: 5
      }
    }
  };

  p5.getKnnData = () => {
    return [
      fish.body.width,
      fish.body.height,
      COLORS.indexOf(fish.body.color),
      fish.eyes.diameter,
      COLORS.indexOf(fish.fins.color),
      fish.fins.topFin.widthPercent,
      fish.fins.topFin.heightPercent,
      fish.fins.sideFin.widthPercent,
      fish.fins.sideFin.heightPercent,
      fish.fins.tail.widthPercent,
      fish.fins.tail.heightPercent
    ];
  };

  p5.download = canvasId => {
    p5.saveCanvas(canvasId, 'png');
  };

  p5.setPartialData = partialFish => {
   /* for (const key in partialFish) {
      if (fish[key]) {
        Object.assign(fish[key], partialFish[key]);
      }
    }*/
  _.merge(fish, partialFish);
  };

  p5.setBodySize = (width, height) => {
    fish.body.width = width;
    fish.body.height = height;
  };

  p5.setBodyColor = color => {
    fish.body.color = color;
  };

  p5.setEyeSize = diameter => {
    fish.eyes.diameter = diameter;
  };

  p5.setEyeType = type => {
    fish.eyes.type = parseInt(type);
  };

  p5.setFinColor = color => {
    fins.color = color;
  };

  p5.setTailSizeRelativeToBody = heightPercent => {
    fins.tail.heightPercent = heightPercent;
  };

  p5.setTopFinSizeRelativeToBody = (widthPercent, heightPercent) => {
    fins.topFin.widthPercent = widthPercent;
    fins.topFin.heightPercent = heightPercent;
  };

  p5.setSideFinSizeRelativeToBody = (widthPercent, heightPercent) => {
    fins.sideFin.widthPercent = widthPercent;
    fins.sideFin.heightPercent = heightPercent;
  };

  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    draw();
  };

  p5.drawTopFin = () => {
    p5.fill(fish.fins.color);
    const body = fish.body;
    const topFin = fish.fins.topFin;
    const topFinWidth = topFin.widthPercent * body.width;
    const topFinHeight = topFin.heightPercent * body.height;
    const bodyYOffsetFromWidth = findBodyYOffsetFromXOffset(
      body,
      topFinWidth / 2
    );
    p5.beginShape();
    p5.vertex(
      BODY_CENTER_X - topFinWidth / 2,
      BODY_CENTER_Y - bodyYOffsetFromWidth
    );
    p5.vertex(BODY_CENTER_X, BODY_CENTER_Y - body.height / 2 - topFinHeight);
    p5.vertex(
      BODY_CENTER_X + topFinWidth / 2,
      BODY_CENTER_Y - bodyYOffsetFromWidth
    );
    p5.endShape(p5.CLOSE);
  };

  p5.drawTail = () => {
    const body = fish.body;
    p5.fill(fish.fins.color);
    const tail = fish.fins.tail;
    const tailWidth = tail.widthPercent * body.width;
    const tailHeight = tail.heightPercent * body.height;
    p5.beginShape();
    p5.vertex(
      BODY_CENTER_X - findBodyXOffsetFromYOffset(body, tailHeight / 4),
      BODY_CENTER_Y - tailHeight / 4
    );
    p5.vertex(
      BODY_CENTER_X - body.width / 2 - tailWidth,
      BODY_CENTER_Y - tailHeight / 2
    );
    p5.vertex(
      BODY_CENTER_X - body.width / 2 - tailWidth,
      BODY_CENTER_Y + tailHeight / 2
    );
    p5.vertex(
      BODY_CENTER_X - findBodyXOffsetFromYOffset(body, tailHeight / 4),
      BODY_CENTER_Y + tailHeight / 4
    );
    p5.endShape(p5.CLOSE);
  };

  p5.drawMouth = () => {
    const body = fish.body;
    //mouth
    p5.noFill();
    const yOffset = 0.15 * body.height;
    const mouthStartY = BODY_CENTER_Y + yOffset;
    const mouthStartX = Math.floor(
      BODY_CENTER_X + findBodyXOffsetFromYOffset(body, yOffset)
    );
    const mouthWidth = 0.25 * body.width;
    const mouthHeight = 0.12 * body.height;
    p5.beginShape();
    p5.vertex(mouthStartX, mouthStartY);
    p5.vertex(mouthStartX - mouthWidth, mouthStartY);
    const bottomLipStart = [mouthStartX - mouthWidth, mouthStartY];
    const bottomLipEnd = [
      BODY_CENTER_X + findBodyXOffsetFromYOffset(body, yOffset + mouthHeight),
      mouthStartY + mouthHeight
    ];

    p5.bezierVertex(
      bottomLipStart[0] + (bottomLipEnd[0] - bottomLipStart[0]) * 0.33,
      bottomLipStart[1] + (bottomLipEnd[1] - bottomLipStart[1]) * 0.85,
      bottomLipStart[0] + (bottomLipEnd[0] - bottomLipStart[0]) * 0.67,
      bottomLipStart[1] + (bottomLipEnd[1] - bottomLipStart[1]),
      BODY_CENTER_X + findBodyXOffsetFromYOffset(body, yOffset + mouthHeight),
      mouthStartY + mouthHeight
    );
    p5.bezierVertex(
      285,
      findBodyYOffsetFromXOffset(body, 85) + BODY_CENTER_Y,
      290,
      findBodyYOffsetFromXOffset(body, 90) + BODY_CENTER_Y,
      mouthStartX,
      mouthStartY
    );
    p5.endShape(p5.CLOSE);
    p5.noFill();

    // teeth
    p5.fill('white');
    const startPoint = [mouthStartX, mouthStartY - 1];
    const endPoint = [bottomLipStart[0], bottomLipStart[1] - 1];
    const topMouthWidth = startPoint[0] - endPoint[0];
    const numTeeth = fish.mouth.teeth.num;
    const toothHeight = fish.mouth.teeth.height;
    const toothWidth = topMouthWidth / numTeeth;
    p5.beginShape();
    p5.vertex(...startPoint);
    for (var i = 1; i <= numTeeth; ++i) {
      p5.vertex(
        startPoint[0] - i * toothWidth + toothWidth / 2,
        startPoint[1] + toothHeight
      );
      p5.vertex(startPoint[0] - i * toothWidth, startPoint[1]);
    }
    p5.endShape();
  };

  p5.drawBody = () => {
    p5.fill(fish.body.color);
    p5.ellipse(BODY_CENTER_X, BODY_CENTER_Y, fish.body.width, fish.body.height);
  };

  p5.drawSideFin = () => {
    const body = fish.body;
    p5.fill(fish.fins.color);
    const sideFin = fish.fins.sideFin;
    const sideFinWidth = sideFin.widthPercent * body.width;
    const sideFinHeight = sideFin.heightPercent * body.height;
    p5.beginShape();
    const startX = BODY_CENTER_X;
    const startY = BODY_CENTER_Y + body.height * 0.35;
    p5.vertex(startX, startY);
    p5.vertex(startX - sideFinWidth, startY - sideFinHeight / 3);
    p5.vertex(startX - sideFinWidth, startY + (2 * sideFinHeight) / 3);
    p5.vertex(startX, startY + sideFinHeight / 3);
    p5.endShape(p5.CLOSE);
  };

  p5.drawEye = () => {
    const body = fish.body;
    const eyes = fish.eyes;
    const eyeXOffset = Math.floor((eyes.xOffsetRatio * body.width) / 2);
    const eyeYOffset = Math.floor((eyes.yOffsetRatio * body.height) / 2);
    const eyeCenterX = BODY_CENTER_X + eyeXOffset;
    const eyeCenterY = BODY_CENTER_Y - eyeYOffset;
    const pupilOffset = Math.floor(eyes.diameter / 4);
    let pupilXOffset = 0;
    let pupilYOffset = 0;

    // outer eye
    p5.fill('white');
    if (eyes.type === EyeType.Circle) {
      p5.ellipse(eyeCenterX, eyeCenterY, eyes.diameter);
    } else if (eyes.type === EyeType.SemiCircleUp) {
      p5.arc(
        eyeCenterX,
        eyeCenterY,
        eyes.diameter,
        eyes.diameter,
        Math.PI,
        2 * Math.PI
      );
      pupilXOffset = pupilOffset;
      pupilYOffset = -pupilOffset;
    } else if (eyes.type === EyeType.SemiCircleDown) {
      p5.arc(eyeCenterX, eyeCenterY, eyes.diameter, eyes.diameter, 0, Math.PI);
      pupilXOffset = pupilOffset;
      pupilYOffset = pupilOffset;
    }

    // pupil
    p5.fill('black');
    p5.ellipse(
      eyeCenterX + pupilXOffset,
      eyeCenterY + pupilYOffset,
      eyes.pupilDiameter
    );
  };

  p5.redraw = () => {
    draw();
  };

  const draw = () => {
    p5.background(BG_COLOR);
    p5.noStroke();
    p5.drawTopFin();
    p5.drawTail();
    p5.drawBody();
    p5.drawSideFin();
    p5.drawMouth();
    p5.drawEye();
  };
};

/**
 * HELPERS
 */
const findBodyYOffsetFromXOffset = (body, xOffset) => {
  return Math.sqrt(
    Math.pow(body.height / 2, 2) *
      (1 - Math.pow(xOffset, 2) / Math.pow(body.width / 2, 2))
  );
};

const findBodyXOffsetFromYOffset = (body, yOffset) => {
  return Math.sqrt(
    Math.pow(body.width / 2, 2) *
      (1 - Math.pow(yOffset, 2) / Math.pow(body.height / 2, 2))
  );
};
