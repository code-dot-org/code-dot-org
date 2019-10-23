var fs = require('fs');
var {loadImage, createCanvas} = require('canvas');

const bodyDirectory = 'public/images/fish/body/';
const body_image_files = fs.readdirSync(bodyDirectory);
body_image_files.forEach(fileName => {
  const imagePath = bodyDirectory + fileName;
  loadImage(imagePath).then(function(image) {
    var canvas = createCanvas(image.width, image.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    var numPixels = 0;
    for (var i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) {
        numPixels++;
      }
    }
    console.log(image.src, (1.0 * image.width) / image.height, numPixels);
  });
});

const eyeDirectory = 'public/images/fish/eyes/';
const eye_image_files = fs.readdirSync(eyeDirectory);
eye_image_files.forEach(fileName => {
  const imagePath = eyeDirectory + fileName;
  loadImage(imagePath).then(function(image) {
    var canvas = createCanvas(image.width, image.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    var numPixels = 0;
    var numPupilPixels = 0;
    for (var i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) {
        numPixels++;
        if (
          imageData.data[i] < 255 &&
          imageData.data[i + 1] < 255 &&
          imageData.data[i + 2] < 255
        ) {
          numPupilPixels++;
        }
      }
    }
    console.log(
      image.src,
      (1.0 * image.width) / image.height,
      numPixels,
      numPixels / numPupilPixels
    );
  });
});

const mouthDirectory = 'public/images/fish/mouth/';
const mouth_image_files = fs.readdirSync(mouthDirectory);
mouth_image_files.forEach(fileName => {
  const imagePath = mouthDirectory + fileName;
  loadImage(imagePath).then(function(image) {
    var canvas = createCanvas(image.width, image.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height);
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    var numPixels = 0;
    for (var i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) {
        numPixels++;
      }
    }
    console.log(image.src, image.width, image.height, (1.0 * image.width) / image.height);
  });
});
