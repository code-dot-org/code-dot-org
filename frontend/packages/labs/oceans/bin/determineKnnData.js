// Outputs some data about body, eye, and mouth images.
var fs = require('fs');
var {loadImage, createCanvas} = require('canvas');

const FishBodyPart = Object.freeze({
  DORSAL_FIN: 0,
  TAIL: 1,
  PECTORAL_FIN_BACK: 2,
  BODY: 3,
  PECTORAL_FIN_FRONT: 4,
  MOUTH: 5,
  EYE: 6
});

const bodyDirectory = 'public/images/fish/body/';
const body_image_files = fs.readdirSync(bodyDirectory);
const bodies = {}
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
    const name = fileName.split('.')[0];
    const src = `${name}_image`;

    console.log(`import ${src} from '../../${imagePath}'`);
    //console.log(image.src, (1.0 * image.width) / image.height, numPixels);

    eyes[name] = {
      src: src,
      anchor: [null, null],
      eyeAnchor: [null, null],
      mouthAnchor: [null, null],
      pectoralFinBackAnchor: [null, null],
      pectoralFinFrontAnchor: [null, null],
      dorsalFinAnchor: [null, null],
      tailAnchor: [null, null],
      knnData: [numPixels, null],
      type: FishBodyPart.BODY
    };

    if (Object.keys(bodies).length === body_image_files.length) {
      console.log(JSON.stringify(bodies, null, 2));
    }    
  });
});

const eyeDirectory = 'public/images/fish/eyes/';
const eye_image_files = fs.readdirSync(eyeDirectory);
const eyes = {}
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

    const name = fileName.split('.')[0];
    const src = `${name}_image`;

    //console.log(`import ${src} from '../../${imagePath}'`);

    eyes[name] = {
      src: src,
      knnData: [numPixels, numPixels / numPupilPixels],
      type: FishBodyPart.EYE
    };
    if (Object.keys(eyes).length === eye_image_files.length) {
      console.log(JSON.stringify(eyes, null, 2));
    }
  });
});

const mouthDirectory = 'public/images/fish/mouth/';
const mouth_image_files = fs.readdirSync(mouthDirectory);
const mouths = {};
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

    //console.log(image.src, image.width, image.height, (1.0 * image.width) / image.height);

    const name = fileName.split('.')[0];
    const src = `${name}_image`;

    console.log(`import ${src} from '../../${imagePath}'`);

    mouths[name] = {
      src: src,
      knnData: [null, (1.0 * image.width) / image.height, null],
      type: FishBodyPart.MOUTH
    };
    if (Object.keys(mouths).length === mouth_image_files.length) {
      console.log(JSON.stringify(mouths, null, 2));
    }
  }).catch(function(error) {console.log(error); console.log(imagePath);});
});
