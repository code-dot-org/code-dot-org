import React from 'react';
import fish from '../../utils/fishData';
const P5 = require('../../utils/loadP5');

export default class SpritesheetFish extends React.Component {
  state = {...fish};

  componentDidMount() {
    this.p5 = new P5(this.sketch, 'canvas');
  }

  sketch = p5 => {
    let body,
      bodyImg,
      eye,
      eyeImg,
      mouth,
      mouthImg,
      sideFin,
      sideFinImg,
      topFin,
      topFinImg,
      tail,
      tailImg;

    p5.preload = () => {
      body = this.state.bodies.body1;
      eye = this.state.eyes.eye2;
      mouth = this.state.mouths.mouth1;
      sideFin = this.state.sideFins.sideFin2;
      topFin = this.state.topFins.topFin2;
      tail = this.state.tails.tail2;

      // Preload images to avoid race condition in setup method.
      bodyImg = p5.loadImage(body.src);
      eyeImg = p5.loadImage(eye.src);
      mouthImg = p5.loadImage(mouth.src);
      sideFinImg = p5.loadImage(sideFin.src);
      topFinImg = p5.loadImage(topFin.src);
      tailImg = p5.loadImage(tail.src);
    };

    p5.setup = () => {
      p5.createCanvas(200, 200);
      // p5.background(220);
      p5.background(0, 51, 153);

      // topFin
      const topFinX = body.anchor[0] + body.topFinAnchor[0];
      const topFinY = body.anchor[1] + body.topFinAnchor[1];
      p5.image(topFinImg, topFinX, topFinY);

      // tail
      const tailX = body.anchor[0] + body.tailAnchor[0];
      const tailY = body.anchor[1] + body.tailAnchor[1];
      p5.image(tailImg, tailX, tailY);

      // body
      p5.image(bodyImg, body.anchor[0], body.anchor[1]);

      // eye
      const eyeX = body.anchor[0] + body.eyeAnchor[0];
      const eyeY = body.anchor[1] + body.eyeAnchor[1];
      p5.image(eyeImg, eyeX, eyeY);

      // mouth
      const mouthX = body.anchor[0] + body.mouthAnchor[0];
      const mouthY = body.anchor[1] + body.mouthAnchor[1];
      p5.image(mouthImg, mouthX, mouthY);

      // sideFin
      const sideFinX = body.anchor[0] + body.sideFinAnchor[0];
      const sideFinY = body.anchor[1] + body.sideFinAnchor[1];
      p5.image(sideFinImg, sideFinX, sideFinY);
    };
  };

  render() {
    return <div id="canvas" />;
  }
}
