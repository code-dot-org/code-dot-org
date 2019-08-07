/**
 * RPS Activity. Based off of:
 * - https://github.com/ryansloan/rps-ml
 * - https://github.com/googlecreativelab/teachable-machine-boilerplate
 */

import * as mobilenetModule from '@tensorflow-models/mobilenet';
import * as tf from '@tensorflow/tfjs';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import React from 'react';

// Number of classes to classify
const NUM_CLASSES = 3;
// Webcam Image size. Must be 227.
const IMAGE_SIZE = 227;
// K value for KNN
const TOPK = 10;
const CLASS_NAMES = ['rock', 'paper', 'scissors'];
let predicted = null;
let example_counts = [0, 0, 0];
const MIN_EXAMPLES = 20;

module.exports = class Main extends React.Component {
  constructor(props) {
    super(props);
    this.video = null;
  }

  state = {
    predictedClass: -1,
    infoText0: "",
    infoText1: "",
    infoText2: "",
    trainingImages0: [],
    trainingImages1: [],
    trainingImages2: [],
  };

  componentDidMount() {
    // Initiate variables
    this.training = -1; // -1 when no class is being trained
    this.videoPlaying = false;

    // Initiate deeplearn.js math and knn classifier objects
    this.bindPage();

    // Create video element that will contain the webcam image
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('playsinline', '');

    navigator.mediaDevices.getUserMedia({video: true, audio: false}).then((stream) => {
      this.video.srcObject = stream;
      this.video.width = IMAGE_SIZE;
      this.video.height = IMAGE_SIZE;

      this.video.addEventListener('playing', () => this.videoPlaying = true);
      this.video.addEventListener('paused', () => this.videoPlaying = false);
    });
  }

  render() {
    return <div>
      <video ref={(el) => this.video = el} autoPlay="" playsInline="" width="227" height="227"/>
      <div style={{marginBottom: 10}}>
        <i>Click each &lsquo;train&rsquo; button to train the computer on one frame from your camera</i><br/>
      </div>
      <button
        style={{position: 'absolute', left: '300px', top: '180px', width: '80px', height: '40px',}}
        onClick={() => this.playRound()}
      >
        PLAY ROUND
      </button>
      {
        [...Array(NUM_CLASSES).keys()].map((index) => {
          return (<div key={index.toString()} style={{marginBottom: "10px"}}>
            <button
              style={{height: '40px'}}
              onClick={() => {
                this.training = index;
                this.trainExample();
              }}
            >
              Train {CLASS_NAMES[index]}
            </button>
            <span style={{fontWeight: this.state.predictedClass === index ? "bold" : "normal"}}>{this.state[`infoText${index}`]}</span>
            {
              this.state['trainingImages' + index].map((image, i) => {
                return <img key={i} src={image} width={40} height={40}/>;
              })
            }
          </div>);
        })
      }
    </div>;
  }

  async bindPage() {
    this.knn = knnClassifier.create();
    this.mobilenet = await mobilenetModule.load();

    this.start();
  }

  start() {
    this.video.play();
  }

  stop() {
    this.video.pause();
  }

  async trainExample() {
    if (this.videoPlaying) {
      // Get image data from video element
      const image = tf.fromPixels(this.video);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');

      const canvas = document.createElement('canvas');
      canvas.width = IMAGE_SIZE / 4;
      canvas.height = IMAGE_SIZE / 4;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
      const dataURI = canvas.toDataURL('image/jpeg');
      this.setState({
        ['trainingImages' + this.training]: this.state['trainingImages' + this.training].concat(dataURI)
      });

      // Train class if one of the buttons is held down
      if (this.training !== -1) {
        logits = infer();
        // Add current image to classifier
        this.knn.addExample(logits, this.training);
      }
      example_counts[this.training]++;
      if (example_counts[this.training] > 0) {
        this.setState({
          [`infoText${this.training}`]: ` ${example_counts[this.training]} examples ${(example_counts[this.training] >=
          MIN_EXAMPLES ? '✅' : '')}`
        });
      }

      // Dispose image when done
      image.dispose();
      if (logits) {
        logits.dispose();
      }
    }
  }

  async playRound() {
    if (this.videoPlaying) {
      // Get image data from video element
      const image = tf.fromPixels(this.video);

      let logits;
      // 'conv_preds' is the logits activation of MobileNet.
      const infer = () => this.mobilenet.infer(image, 'conv_preds');

      const numClasses = this.knn.getNumClasses();
      if (numClasses > 0) {

        // If classes have been added run predict
        logits = infer();
        const res = await this.knn.predictClass(logits, TOPK);

        for (let i = 0; i < NUM_CLASSES; i++) {

          // The number of examples for each class
          const exampleCount = this.knn.getClassExampleCount();

          // Make the predicted class bold
          if (res.classIndex === i) {
            this.setState({predictedClass: i});
          }

          // Update info text
          if (exampleCount[i] > 0) {
            this.setState({
              [`infoText${i}`]: ` ${exampleCount[i]} examples - ${res.confidences[i] * 100}%`
            });
          }
        }
        predicted = CLASS_NAMES[res.classIndex];
      }
      this.roundResult();
      // Dispose image when done
      image.dispose();
      if (logits) {
        logits.dispose();
      }
    }
  }

  roundResult() {
    let computer_choice = CLASS_NAMES[Math.floor(Math.random() * 3)];
    const winner = this.pickWinner(computer_choice);
    console.log(winner);
    alert(
      `You played...${predicted}\n Computer played ${computer_choice}\n${winner > 0 ? 'YOU WIN' : winner === 0 ? 'DRAW' : 'YOU LOSE'}`);

  }

  pickWinner(computer_choice) {
    return this.beats(predicted, computer_choice);
  }

  beats(x, y) {
    const keyBeatsValue = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };

    return keyBeatsValue[x] === y ? 1 :
      keyBeatsValue[y] === x ? -1 :
      0;
  }
};
