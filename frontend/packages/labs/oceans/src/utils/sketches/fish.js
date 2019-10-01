const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const BG_COLOR = 250;

const BODY_CENTER_X = CANVAS_WIDTH / 2;
const BODY_CENTER_Y = CANVAS_HEIGHT / 2;
let body = {
  width: 200,
  height: 50,
  color: '#DC1C4B'
};
let fins = {
  color: '#87D1EE',
  tail: {
    width: 10,
    height: 40
  },
  top_fin: {
    width: 30,
    height: 10
  },
  side_fin: {
    width: 10,
    height: 30
  }
};
let eyes = {
  x_offset_ratio: 0.7,
  y_offset_ratio: 0.25,
  diameter: 25,
  pupil_diameter: 5
};
let mouth = {
  teeth: {
    num: 5,
    height: 5
  }
};

const findBodyYOffsetFromXOffset = xOffset => {
  return Math.sqrt(
    Math.pow(body.height / 2, 2) *
      (1 - Math.pow(xOffset, 2) / Math.pow(body.width / 2, 2))
  );
};

const findBodyXOffsetFromYOffset = yOffset => {
  return Math.sqrt(
    Math.pow(body.width / 2, 2) *
      (1 - Math.pow(yOffset, 2) / Math.pow(body.height / 2, 2))
  );
};

module.exports = p5 => {
  p5.setup = () => {
    p5.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    draw();
  };

  const draw = () => {
    p5.background(BG_COLOR);

    // top fin
    p5.fill(fins.color);
    p5.noStroke();
    const top_fin = fins.top_fin;
    p5.beginShape();
    // start the top fin on the top in the center
    p5.vertex(BODY_CENTER_X, BODY_CENTER_Y - body.height / 2);
    p5.vertex(
      BODY_CENTER_X - top_fin.width / 2,
      BODY_CENTER_Y -
        findBodyYOffsetFromXOffset(top_fin.width / 2) -
        top_fin.height
    );
    p5.vertex(
      BODY_CENTER_X - top_fin.width,
      BODY_CENTER_Y - findBodyYOffsetFromXOffset(top_fin.width)
    );
    p5.endShape(p5.CLOSE);

    // tail
    p5.fill(fins.color);
    p5.noStroke();
    const tail = fins.tail;
    p5.beginShape();
    p5.vertex(
      BODY_CENTER_X - findBodyXOffsetFromYOffset(tail.height / 4),
      BODY_CENTER_Y - tail.height / 4
    );
    p5.vertex(
      BODY_CENTER_X - body.width / 2 - tail.width,
      BODY_CENTER_Y - tail.height / 2
    );
    p5.vertex(
      BODY_CENTER_X - body.width / 2 - tail.width,
      BODY_CENTER_Y + tail.height / 2
    );
    p5.vertex(
      BODY_CENTER_X - findBodyXOffsetFromYOffset(tail.height / 4),
      BODY_CENTER_Y + tail.height / 4
    );
    p5.endShape(p5.CLOSE);

    // body
    p5.fill(body.color);
    p5.noStroke();
    p5.ellipse(BODY_CENTER_X, BODY_CENTER_Y, body.width, body.height);

    // side fin
    p5.fill(fins.color);
    p5.noStroke();
    const side_fin = fins.side_fin;
    p5.beginShape();
    //p5.vertex(230, 190);
    const startX = BODY_CENTER_X;
    const startY = BODY_CENTER_Y - body.height / 10;
    p5.vertex(startX, startY);
    p5.vertex(startX - side_fin.width, startY - side_fin.height / 3);
    p5.vertex(startX - side_fin.width, startY + (2 * side_fin.height) / 3);
    p5.vertex(startX, startY + side_fin.height / 3);
    p5.endShape(p5.CLOSE);

    // eye
    const eye_x_offset = Math.floor((eyes.x_offset_ratio * body.width) / 2);
    const eye_y_offset = Math.floor((eyes.y_offset_ratio * body.height) / 2);
    const eye_center_x = BODY_CENTER_X + eye_x_offset;
    const eye_center_y = BODY_CENTER_Y - eye_y_offset;
    p5.stroke('black');
    p5.fill('white');
    p5.ellipse(eye_center_x, eye_center_y, eyes.diameter, eyes.diameter);
    p5.fill('black');
    p5.ellipse(
      eye_center_x,
      eye_center_y,
      eyes.pupil_diameter,
      eyes.pupil_diameter
    );

    //mouth
    p5.fill(BG_COLOR);
    p5.stroke(BG_COLOR);
    p5.strokeWeight(3);

    const yOffset = 0.15 * body.height;
    const mouthStartY = BODY_CENTER_Y + yOffset;
    console.log(mouthStartY);
    const mouthStartX = Math.floor(
      BODY_CENTER_X + findBodyXOffsetFromYOffset(yOffset)
    );
    const mouthWidth = 0.25 * body.width;
    const mouthHeight = 0.12 * body.height;
    p5.beginShape();
    p5.vertex(mouthStartX, mouthStartY);
    p5.vertex(mouthStartX - mouthWidth, mouthStartY);
    const bottom_lip_start = [mouthStartX - mouthWidth, mouthStartY];
    const bottom_lip_end = [
      BODY_CENTER_X + findBodyXOffsetFromYOffset(yOffset + mouthHeight),
      mouthStartY + mouthHeight
    ];

    p5.bezierVertex(
      bottom_lip_start[0] + (bottom_lip_end[0] - bottom_lip_start[0]) * 0.33,
      bottom_lip_start[1] + (bottom_lip_end[1] - bottom_lip_start[1]) * 0.85,
      bottom_lip_start[0] + (bottom_lip_end[0] - bottom_lip_start[0]) * 0.67,
      bottom_lip_start[1] + (bottom_lip_end[1] - bottom_lip_start[1]),
      BODY_CENTER_X + findBodyXOffsetFromYOffset(yOffset + mouthHeight),
      mouthStartY + mouthHeight
    );
    p5.bezierVertex(
      285,
      findBodyYOffsetFromXOffset(85) + BODY_CENTER_Y,
      290,
      findBodyYOffsetFromXOffset(90) + BODY_CENTER_Y,
      mouthStartX,
      mouthStartY
    );
    p5.endShape(p5.CLOSE);
    p5.noFill();
    // reset
    p5.stroke(0);
    p5.strokeWeight(1);

    // teeth
    p5.fill('white');
    const startPoint = [mouthStartX, mouthStartY - 1];
    const endPoint = [bottom_lip_start[0], bottom_lip_start[1] - 1];
    const topMouthWidth = startPoint[0] - endPoint[0];
    const numTeeth = mouth.teeth.num;
    const toothHeight = mouth.teeth.height;
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

  p5.download = canvasId => {
    p5.saveCanvas(canvasId, 'png');
  };
};
