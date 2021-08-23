import * as utils from './utils';
export const commands = {
  setForegroundEffect(effectName) {
    var i;
    if (effectName === 'rain') {
      var drops = [];
      for (i = 0; i < 20; i++) {
        drops.push({
          x: this.randomNumber(0, 380),
          y: this.randomNumber(0, 380),
          length: this.randomNumber(10, 20)
        });
      }
      this.foregroundEffect = () => {
        this.p5.push();
        this.p5.stroke(this.p5.rgb(92, 101, this.randomNumber(140, 220), 0.5));
        this.p5.strokeWeight(3);
        for (var i = 0; i < drops.length; i++) {
          this.p5.push();
          this.p5.translate(drops[i].x - 20, drops[i].y - 20);
          this.p5.line(0, 0, drops[i].length, drops[i].length * 2);
          drops[i].y = (drops[i].y + drops[i].length) % 420;
          drops[i].x = (drops[i].x + drops[i].length / 2) % 420;
          this.p5.pop();
        }
        this.p5.pop();
      };
    } else if (effectName === 'bubbles') {
      var bubbles = [];
      for (i = 0; i < 25; i++) {
        bubbles.push({
          x: this.p5.random(-100, 400),
          y: 410,
          velocityX: this.p5.random(-2, 2),
          size: this.p5.random(6, 12, 18),
          color: utils.randomColor(this.p5)
        });
      }
      this.foregroundEffect = () => {
        this.p5.push();
        this.p5.noStroke();
        for (var i = 0; i < bubbles.length; i++) {
          var bubble = bubbles[i];
          this.p5.push();
          this.p5.fill(bubble.color);
          this.p5.translate(bubble.x, bubble.y);
          this.p5.ellipse(0, 0, bubble.size, bubble.size);
          var fallSpeed = this.p5.map(bubble.size, 6, 12, 1, 3);
          bubble.y -= fallSpeed;
          if (bubble.y < 0) {
            bubble.y = 420;
          }
          bubble.x += bubble.velocityX;
          if (bubble.x < 0 || bubble.x > 400) {
            bubble.velocityX *= -1;
          }
          this.p5.pop();
        }
        this.p5.pop();
      };
    }
  }
};
