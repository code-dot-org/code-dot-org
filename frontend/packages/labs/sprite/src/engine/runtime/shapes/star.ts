import type {SpriteP5} from '../../../sprites';

// From @code-dot-org/dance-party 2.0.4, src/shapes/star.js.
// Star helper function from https://p5js.org/examples/form-star.html
export function drawStar(
  p5: SpriteP5,
  x: number,
  y: number,
  radius1: number,
  radius2: number,
  numPoints: number,
): void {
  const angle = 360 / numPoints;
  const halfAngle = angle / 2.0;
  p5.beginShape();
  for (let a = 0; a < 360; a += angle) {
    let sx = x + p5.cos(a) * radius2;
    let sy = y + p5.sin(a) * radius2;
    p5.vertex(sx, sy);
    sx = x + p5.cos(a + halfAngle) * radius1;
    sy = y + p5.sin(a + halfAngle) * radius1;
    p5.vertex(sx, sy);
  }
  p5.endShape(p5.CLOSE);
}
