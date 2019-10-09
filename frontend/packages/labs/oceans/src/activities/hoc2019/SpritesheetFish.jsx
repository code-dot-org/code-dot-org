/* eslint-disable react/prop-types */
/* See https://github.com/yannickcr/eslint-plugin-react/issues/2343
 * for explanation for above eslint-disable.
 * */

import React from 'react';
import fish, {fishShape} from '../../utils/fishData';
const P5 = require('../../utils/loadP5');

export const generateRandomFish = () => {
  const bodies = Object.values(fish.bodies);
  const eyes = Object.values(fish.eyes);
  const mouths = Object.values(fish.mouths);
  const sideFins = Object.values(fish.sideFins);
  const topFins = Object.values(fish.topFins);
  const tails = Object.values(fish.tails);

  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const eye = eyes[Math.floor(Math.random() * eyes.length)];
  const mouth = mouths[Math.floor(Math.random() * mouths.length)];
  const sideFin = sideFins[Math.floor(Math.random() * sideFins.length)];
  const topFin = topFins[Math.floor(Math.random() * topFins.length)];
  const tail = tails[Math.floor(Math.random() * tails.length)];
  const knnData = [
    ...body.knnData,
    ...eye.knnData,
    ...mouth.knnData,
    ...sideFin.knnData,
    ...topFin.knnData,
    ...tail.knnData
  ];

  return {
    body,
    eye,
    mouth,
    sideFin,
    topFin,
    tail,
    knnData
  };
};

export default class SpritesheetFish extends React.Component {
  render() {
    const randomFish = generateRandomFish();

    return (
      <Fish
        body={randomFish.body}
        eye={randomFish.eye}
        mouth={randomFish.mouth}
        sideFin={randomFish.sideFin}
        topFin={randomFish.topFin}
        tail={randomFish.tail}
        canvasId="canvas"
      />
    );
  }
}

export class Fish extends React.Component {
  static propTypes = {fishShape};

  componentDidMount() {
    this.p5 = new P5(this.sketch, this.props.canvasId);
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
      body = this.props.body;
      eye = this.props.eye;
      mouth = this.props.mouth;
      sideFin = this.props.sideFin;
      topFin = this.props.topFin;
      tail = this.props.tail;

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
    return <div id={this.props.canvasId} />;
  }
}
