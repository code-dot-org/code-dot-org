var fs = require('fs');
var {loadImage, createCanvas} = require('canvas');
global.fetch = require('node-fetch');
const argv = require('yargs').argv;

var mobilenetModule = require('@tensorflow-models/mobilenet');
var tf = require('@tensorflow/tfjs');
var knnClassifier = require('@tensorflow-models/knn-classifier');

/*
  Commandline parameters:
    --trainingnum -- the number of images to use as training data, with the rest used for testing
    --cat0_dir -- the directory where the images for the first category live
    --cat1_dir -- the directory where the images for the second category live
*/
var trainingnum = 10;
if (argv.trainingnum) {
  trainingnum = argv.trainingnum;
}
if (!argv.cat0_dir || !argv.cat1_dir) {
  console.log('Please supply directories for both classifications');
  process.exit(1);
}
var cat0_dir = argv.cat0_dir;
var cat1_dir = argv.cat1_dir;

var correct = 0;
var incorrect = 0;
var knn, mobilenet;

async function setup() {
  knn = knnClassifier.create();
  mobilenet = await mobilenetModule.load();
}

function addExample(imageOrVideoElement, classId) {
  const image = tf.fromPixels(imageOrVideoElement);
  const infer = () => mobilenet.infer(image, 'conv_preds');

  let logits;
  if (classId !== -1) {
    logits = infer();
    knn.addExample(logits, classId);
  }
  image.dispose();
  if (logits) {
    logits.dispose();
  }
}

async function predict(videoElement, expectedClass) {
  const image = tf.fromPixels(videoElement);
  const infer = () => mobilenet.infer(image, 'conv_preds');

  let logits = infer();

  const TOPK = 10;
  const res = await knn.predictClass(logits, TOPK);

  if (res.classIndex === expectedClass) {
    correct++;
  } else {
    incorrect++;
  }

  if (logits) {
    logits.dispose();
  }

  image.dispose();
}

cat0_files = fs.readdirSync(cat0_dir);
cat0_files.sort(() => Math.random() - 0.5);
cat1_files = fs.readdirSync(cat1_dir);
cat1_files.sort(() => Math.random() - 0.5);

setup().then(() => {
  cat0_loadimage_promises = [];
  cat1_loadimage_promises = [];
  //training
  for (var i = 0; i < trainingnum; ++i) {
    var cat0_image = cat0_files[i];
    var cat1_image = cat1_files[i];
    if (!cat0_image || !cat1_image) break;

    if (cat0_image) {
      cat0_loadimage_promises.push(
        loadImage(cat0_dir + cat0_image).then(function(image) {
          var canvas = createCanvas(100, 100);
          var ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, 100, 100);
          addExample(canvas, 0);
        })
      );
    }
    if (cat1_image) {
      cat1_loadimage_promises.push(
        loadImage(cat1_dir + cat1_image).then(function(image) {
          var canvas = createCanvas(100, 100);
          var ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, 100, 100);
          addExample(canvas, 1);
        })
      );
    }
  }
  Promise.all(cat0_loadimage_promises).then(() => {
    Promise.all(cat1_loadimage_promises).then(() => {
      //predictions!
      var cat0_prediction_promises = [];
      var cat1_prediction_promises = [];
      console.log(knn.getClassExampleCount());
      for (
        var i = trainingnum;
        i < Math.max(cat0_files.length, cat1_files.length);
        ++i
      ) {
        var cat0_image = cat0_files[i];
        var cat1_image = cat1_files[i];
        if (cat0_image) {
          loadImage(cat0_dir + cat0_image).then(function(image) {
            var canvas = createCanvas(100, 100);
            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, 100, 100);
            cat0_prediction_promises.push(predict(canvas, 0));
          });
        }
        if (cat1_image) {
          loadImage(cat1_dir + cat1_image).then(function(image) {
            var canvas = createCanvas(100, 100);
            var ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, 100, 100);
            cat1_prediction_promises.push(predict(canvas, 1));
          });
        }
      }
      Promise.all(cat0_prediction_promises).then(() => {
        Promise.all(cat1_prediction_promises).then(() => {
          console.log('correct:', correct, 'incorrect:', incorrect);
        });
      });
    });
  });
});
