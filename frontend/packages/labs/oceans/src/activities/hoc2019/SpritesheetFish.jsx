import React from 'react';
const P5 = require('../../utils/loadP5');

export default class SpritesheetFish extends React.Component {
  state = {
    bodies: [
      {
        src: '/images/fish/body_1.png',
        eyeAnchor: [45, 50],
        mouthAnchor: [50, 50],
        sideFinAnchor: [50, 55],
        topFinAnchor: [50, 50],
        tailAnchor: [55, 55]
      },
      {
        src: '/images/fish/body_2.png',
        eyeAnchor: [57, 47],
        mouthAnchor: [50, 50],
        sideFinAnchor: [50, 50],
        topFinAnchor: [50, 50],
        tailAnchor: [48, 51]
      }
    ],
    eyes: [{src: '/images/fish/eye_1.png'}, {src: '/images/fish/eye_2.png'}],
    mouths: [
      {src: '/images/fish/mouth_1.png'},
      {src: '/images/fish/mouth_2.png'}
    ],
    sideFins: [
      {src: '/images/fish/side_fin_1.png'},
      {src: '/images/fish/side_fin_2.png'}
    ],
    topFins: [
      {src: '/images/fish/top_fin_1.png'},
      {src: '/images/fish/top_fin_2.png'}
    ],
    tails: [{src: '/images/fish/tail_1.png'}, {src: '/images/fish/tail_2.png'}]
  };

  componentDidMount() {
    this.p5 = new P5(this.sketch, 'canvas');
  }

  sketch = p5 => {
    let bodyObj,
      body,
      eye1,
      eye2,
      mouth1,
      mouth2,
      sideFin1,
      sideFin2,
      topFin1,
      topFin2,
      tail1,
      tail2;

    p5.preload = () => {
      bodyObj = this.state.bodies[1];
      body = p5.loadImage(bodyObj.src);
      eye1 = p5.loadImage(this.state.eyes[0].src);
      eye2 = p5.loadImage(this.state.eyes[1].src);
      mouth1 = p5.loadImage(this.state.mouths[0].src);
      mouth2 = p5.loadImage(this.state.mouths[1].src);
      sideFin1 = p5.loadImage(this.state.sideFins[0].src);
      sideFin2 = p5.loadImage(this.state.sideFins[1].src);
      topFin1 = p5.loadImage(this.state.topFins[0].src);
      topFin2 = p5.loadImage(this.state.topFins[1].src);
      tail1 = p5.loadImage(this.state.tails[0].src);
      tail2 = p5.loadImage(this.state.tails[1].src);
    };

    p5.setup = () => {
      p5.createCanvas(200, 200);
      // p5.background(220);
      p5.background(0, 51, 153);

      // topFin choice
      const topFinX = bodyObj.topFinAnchor[0];
      const topFinY = bodyObj.topFinAnchor[1];
      // p5.image(topFin1, topFinX, topFinY);
      p5.image(topFin2, topFinX, topFinY);

      // tail choice
      const tailX = bodyObj.tailAnchor[0];
      const tailY = bodyObj.tailAnchor[1];
      // p5.image(tail1, tailX, tailY);
      p5.image(tail2, tailX, tailY);

      // body
      p5.image(body, 50, 50);

      // eye choice
      const eyeX = bodyObj.eyeAnchor[0];
      const eyeY = bodyObj.eyeAnchor[1];
      // p5.image(eye1, eyeX, eyeY);
      p5.image(eye2, eyeX, eyeY);

      // mouth choice
      const mouthX = bodyObj.mouthAnchor[0];
      const mouthY = bodyObj.mouthAnchor[1];
      p5.image(mouth1, mouthX, mouthY);
      // p5.image(mouth2, mouthX, mouthY);

      // sideFin choice
      const sideFinX = bodyObj.sideFinAnchor[0];
      const sideFinY = bodyObj.sideFinAnchor[1];
      // p5.image(sideFin1, sideFinX, sideFinY);
      p5.image(sideFin2, sideFinX, sideFinY);
    };
  };

  render() {
    return <div id="canvas" />;
  }
}
