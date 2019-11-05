// Outputs some data about body, eye, and mouth images.
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
    const name = fileName.split('.')[0];
    const src = `${name}_image`;

    console.log(`import ${src} from '../../${imagePath}'`);

    const json = `    ${name}: {
      src: ${src},
      anchor: [null, null],
      eyeAnchor: [null, null],
      mouthAnchor: [null, null],
      pectoralFinBackAnchor: [null, null],
      pectoralFinFrontAnchor: [null, null],
      dorsalFinAnchor: [null, null],
      tailAnchor: [null, null],
      knnData: [${numPixels}, null],
      type: FishBodyPart.BODY
    },`;
    console.log(json);
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

    const name = fileName.split('.')[0];
    const src = `${name}_image`;

    console.log(`import ${src} from '../../${imagePath}'`);

    const json = `    ${name}: {
      src: ${src},
      knnData: [${numPixels}, ${numPixels / numPupilPixels}],
      type: FishBodyPart.EYE
    },`;
    console.log(json);
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

    const name = fileName.split('.')[0];
    const src = `${name}_image`;

    console.log(`import ${src} from '../../${imagePath}'`);

    const json = `    ${name}: {
      src: ${src},
      knnData: [null, ${(1.0 * image.width) / image.height}, null],
      tinted: foo,
      type: FishBodyPart.MOUTH
    },`;
    console.log(json);
  });
});

// Parts without automically calculated KNN data
const otherParts = {
  PECTORAL_FIN_FRONT: 'pectoralFin',
  PECTORAL_FIN_BACK: 'pectoralFin',
  DORSAL_FIN: 'dorsalFin',
  TAIL: 'tailFin'
}

for ([partName, dirName] of Object.entries(otherParts)) {
  const dirPath = `public/images/fish/${dirName}/`;
  const image_files = fs.readdirSync(dirPath);

  image_files.forEach(fileName => {
    const imagePath = dirPath + fileName;
    const name = fileName.split('.')[0];
    const src = `${name}_image`;

    console.log(`import ${src} from '../../${imagePath}'`);

    const json = `    ${name}: {
      src: ${src},
      knnData: [],
      type: FishBodyPart.${partName}
    },`;
    console.log(json);
  });
}
