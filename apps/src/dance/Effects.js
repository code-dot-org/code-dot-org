export default class Effects {
  constructor(p5, alpha, blend) {
    this.blend = blend || p5.BLEND;

    function randomNumber(min, max) {
      return Math.floor(p5.random(min, max));
    }

    this.none = {
      draw: function ({backgroundColor}) {
        p5.background(backgroundColor || "white");
      }
    };

    this.rainbow = {
      color: p5.color('hsla(0, 100%, 80%, ' + alpha + ')'),
      update: function () {
        p5.push();
        p5.colorMode(p5.HSL);
        this.color =
          p5.color(this.color._getHue() + 10, 100, 80, alpha);
        p5.pop();
      },
      draw: function ({isPeak}) {
        if (isPeak) {
          this.update();
        }
        p5.background(this.color);
      }
    };

    this.disco = {
      bg: undefined,
      init: function () {
        this.bg = createGraphics(World.width, World.height);
        this.bg.noStroke();
        for (let i = 0; i < 16; i++) {
          this.bg.fill(
            p5.color("hsla(" + randomNumber(0, 359) + ", 100%, 80%, " + alpha + ")"));
          this.bg.rect((i % 4) * 50, Math.floor(i / 4) * 50, 50, 50);
        }
      },
      update: function () {
        for (let i = randomNumber(5, 10); i > 0; i--) {
          let loc = randomNumber(0, 15);
          this.bg.fill(p5.color("hsla(" + randomNumber(0, 359) + ", 100%, 80%, " + alpha + ")"));
          this.bg.rect((loc % 4) * 50, Math.floor(i / 4) * 50, 50, 50);
        }
      },
      draw: function ({isPeak}) {
        if (!this.bg) this.init();
        if (isPeak) this.update();
        p5.image(this.bg, 0, 0);
      }
    };

    this.diamonds = {
      hue: 0,
      update: function () {
        this.hue += 25;
      },
      draw: function ({isPeak, centroid}) {
        if (isPeak) {
          this.update();
        }
        p5.push();
        p5.colorMode(p5.HSB);
        p5.rectMode(p5.CENTER);
        p5.translate(200, 200);
        p5.rotate(45);
        p5.noFill();
        p5.strokeWeight(p5.map(centroid, 0, 4000, 0, 50));
        for (let i = 5; i > -1; i--) {
          p5.stroke((this.hue + i * 10) % 360, 100, 75, alpha);
          p5.rect(0, 0, i * 100 + 50, i * 100 + 50);
        }
        p5.pop();
      }
    };

    this.strobe = {
      waitTime: 0,
      flashing: false,
      update: function () {
        this.flashing = true;
        this.waitTime = 6;
      },
      draw: function ({isPeak}) {
        let bgcolor = p5.rgb(1, 1, 1);
        if (isPeak) {
          this.update();
        }
        if (this.flashing) {
          bgcolor = p5.rgb(255, 255, 255);
          this.waitTime--;
        }
        if (this.waitTime <= 0) {
          bgcolor = p5.rgb(1, 1, 1);
          this.flashing = false;
        }
        p5.background(bgcolor);
      }
    };

    this.rain = {
      drops: [],
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.drops.push({
            x: randomNumber(0, 380),
            y: randomNumber(0, 380),
            length: randomNumber(10, 20),
          });
        }
      },
      color: p5.rgb(127, 127, 255, 0.5),
      update: function () {
        this.color = p5.rgb(127, 127, randomNumber(127, 255), 0.5);
      },
      draw: function () {
        if (this.drops.length < 1) {
          this.init();
        }
        p5.strokeWeight(3);
        p5.stroke(this.color);
        p5.push();
        for (let i = 0; i < this.drops.length; i++) {
          p5.push();
          p5.translate(this.drops[i].x - 20, this.drops[i].y - 20);
          p5.line(0, 0, this.drops[i].length, this.drops[i].length * 2);
          p5.pop();
          this.drops[i].y = (this.drops[i].y + this.drops[i].length) % 420;
          this.drops[i].x = (this.drops[i].x + (this.drops[i].length / 2)) % 420;
        }
        p5.pop();
      }
    };

    this.raining_tacos = {
      tacos: [],
      size: 50,
      init: function () {
        for (let i = 0; i < 20; i++) {
          this.tacos.push({
            x: randomNumber(20, 380),
            y: randomNumber(20, 380),
            rot: randomNumber(0, 359),
            speed: randomNumber(2, 5),
          });
        }
      },
      update: function () {
        this.size += randomNumber(-5, 5);
      },
      draw: function () {
        if (this.tacos.length < 1) {
          this.init();
        }
        for (let i = 0; i < this.tacos.length; i++) {
          p5.push();
          const taco = this.tacos[i];
          p5.translate(taco.x, taco.y);
          p5.rotate(taco.rot);
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.textSize(this.size);
          p5.text(String.fromCodePoint(55356, 57134), 0, 0);
          taco.y += taco.speed;
          taco.rot++;
          if (taco.y > 450) {
            taco.x = randomNumber(20, 380);
            taco.y = -50;
          }
          p5.pop();
        }
      }
    };
  }
}
