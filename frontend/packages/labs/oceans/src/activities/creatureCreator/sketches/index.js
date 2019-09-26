import { CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_BG_COLOR } from "../utils";

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

  p5.setCreature = props => {
    p5.clear();
    eyes = props.eyes;
    draw();
  };
};

export default sketch;
