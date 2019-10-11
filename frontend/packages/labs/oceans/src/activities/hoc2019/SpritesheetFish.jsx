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
  const colorPalettes = Object.values(fish.colorPalettes);

  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const eye = eyes[Math.floor(Math.random() * eyes.length)];
  const mouth = mouths[Math.floor(Math.random() * mouths.length)];
  const sideFin = sideFins[Math.floor(Math.random() * sideFins.length)];
  const topFin = topFins[Math.floor(Math.random() * topFins.length)];
  const tail = tails[Math.floor(Math.random() * tails.length)];
  const colorPalette =
    colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  const knnData = [
    ...body.knnData,
    ...eye.knnData,
    ...mouth.knnData,
    ...sideFin.knnData,
    ...topFin.knnData,
    ...tail.knnData,
    ...colorPalette.knnData
  ];

  return {
    body,
    eye,
    mouth,
    sideFin,
    topFin,
    tail,
    colorPalette,
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
        colorPalette={randomFish.colorPalette}
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

  colorImage(img, color) {
    img.loadPixels();
    for (var x = 0; x < img.width; ++x) {
      for (var y = 0; y < img.height; ++y) {
        const i = (x + y * img.width) * 4;
        if (
          img.pixels[i] === 255 &&
          img.pixels[i + 1] === 255 &&
          img.pixels[i + 2] === 255
        ) {
          img.pixels[i] = color.levels[0];
          img.pixels[i + 1] = color.levels[1];
          img.pixels[i + 2] = color.levels[2];
          //img.pixels[i + 3] = color.levels[3];
        }
      }
    }
    img.updatePixels();
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
      tailImg,
      colorPalette,
      bodyColor,
      finColor,
      mouthColor;

    p5.preload = () => {
      body = this.props.body;
      eye = this.props.eye;
      mouth = this.props.mouth;
      sideFin = this.props.sideFin;
      topFin = this.props.topFin;
      tail = this.props.tail;
      colorPalette = this.props.colorPalette;

      // Preload images to avoid race condition in setup method.
      bodyImg = p5.loadImage(body.src);
      eyeImg = p5.loadImage(eye.src);
      mouthImg = p5.loadImage(mouth.src);
      sideFinImg = p5.loadImage(sideFin.src);
      topFinImg = p5.loadImage(topFin.src);
      tailImg = p5.loadImage(tail.src);
      bodyColor = p5.color(colorPalette.bodyColor);
      finColor = p5.color(colorPalette.finColor);
      mouthColor = p5.color(colorPalette.mouthColor);
    };

    p5.setup = () => {
      p5.createCanvas(200, 200);
      // p5.background(220);
      p5.background(0, 51, 153);

      this.colorImage(bodyImg, bodyColor);
      this.colorImage(sideFinImg, finColor);
      this.colorImage(topFinImg, finColor);
      this.colorImage(tailImg, finColor);
      this.colorImage(mouthImg, mouthColor);
      // topFin
      const topFinX = body.anchor[0] + body.topFinAnchor[0];
      const topFinY = body.anchor[1] + body.topFinAnchor[1];
      p5.image(topFinImg, topFinX, topFinY);

      // tail
      const tailX = body.anchor[0] + body.tailAnchor[0] + tail.transform[0];
      const tailY = body.anchor[1] + body.tailAnchor[1] + tail.transform[1];
      p5.image(tailImg, tailX, tailY);

      // body
      p5.image(bodyImg, body.anchor[0], body.anchor[1]);

      // eye
      const eyeX = body.anchor[0] + body.eyeAnchor[0];
      const eyeY = body.anchor[1] + body.eyeAnchor[1];
      p5.image(eyeImg, eyeX, eyeY);

      // mouth
      const mouthX = body.anchor[0] + body.mouthAnchor[0] + mouth.transform[0];
      const mouthY = body.anchor[1] + body.mouthAnchor[1] + mouth.transform[1];
      p5.image(mouthImg, mouthX, mouthY);

      // sideFin
      const sideFinX =
        body.anchor[0] + body.sideFinAnchor[0] + sideFin.transform[0];
      const sideFinY =
        body.anchor[1] + body.sideFinAnchor[1] + sideFin.transform[1];
      p5.image(sideFinImg, sideFinX, sideFinY);
    };
  };

  render() {
    return <div id={this.props.canvasId} />;
  }
}
