var fs = require('fs')
var {loadImage, createCanvas} = require('canvas');
global.fetch = require('node-fetch');
const argv = require('yargs').argv 

var mobilenetModule = require('@tensorflow-models/mobilenet');
var tf = require('@tensorflow/tfjs');
var knnClassifier = require('@tensorflow-models/knn-classifier');

var cat1_dir = '../evaluationtestimages/smilyfrownyfaces/frownyfaces/'
var cat2_dir = '../evaluationtestimages/smilyfrownyfaces/smilyfaces/'


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
  /*let result = {
    predictedClassId: null,
    confidencesByClassId: []
  };*/

  let logits = infer();

  const TOPK = 10;
  const res = await knn.predictClass(logits, TOPK);

  //result.predictedClassId = res.classIndex;
  //result.confidencesByClassId = res.confidences;
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


var trainingnum = 10;
if (argv.trainingnum) {
  trainingnum = argv.trainingnum
}
cat1_files = fs.readdirSync(cat1_dir);
cat1_files.sort(() => Math.random() - 0.5);
cat2_files = fs.readdirSync(cat2_dir);
cat2_files.sort(() => Math.random() - 0.5);


setup().then(() => {

  cat1_loadimage_promises = []
  cat2_loadimage_promises = []
  //training
  for (var i = 0; i < trainingnum; ++i) {
    var cat1_image = cat1_files[i];
    var cat2_image = cat2_files[i];
    if (!cat1_image || !cat2_image) break;

    
    cat1_loadimage_promises.push(loadImage(cat1_dir + cat1_image).then(function(image) {
      var canvas = createCanvas(100, 100);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, 100, 100);
      addExample(canvas, 0);  
    }));
    cat2_loadimage_promises.push(loadImage(cat2_dir + cat2_image).then(function(image) {
      var canvas = createCanvas(100, 100);
      var ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, 100, 100);
      addExample(canvas, 1);  
    }));
  }
  Promise.all(cat1_loadimage_promises).then(() => {
    Promise.all(cat2_loadimage_promises).then(() => {
      //predictions!
      var cat1_prediction_promises = []
      var cat2_prediction_promises = []
      console.log(knn.getClassExampleCount())
      for (var i = trainingnum; i < Math.min(cat1_files.length, cat2_files.length); ++i) {
        var cat1_image = cat1_files[i];
        var cat2_image = cat2_files[i];
        if (!cat1_image || !cat2_image) break;
        loadImage(cat1_dir + cat1_image).then(function(image) {
          var canvas = createCanvas(100, 100);
          var ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, 100, 100);
          cat1_prediction_promises.push(predict(canvas, 0));
        });
        loadImage(cat2_dir + cat2_image).then(function(image) {
          var canvas = createCanvas(100, 100);
          var ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, 100, 100);
          cat2_prediction_promises.push(predict(canvas, 1));
        });
      }
    Promise.all(cat1_prediction_promises).then(() => {
      Promise.all(cat2_prediction_promises).then( () => {
        console.log("correct:", correct, "incorrect:", incorrect);
      })
    });
  })
})

});

