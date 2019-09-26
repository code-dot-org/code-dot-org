/**
 * RPS Activity. Based off of:
 * - https://github.com/ryansloan/rps-ml
 * - https://github.com/googlecreativelab/teachable-machine-boilerplate
 */

import React from 'react';

import SimpleTrainer from '../../utils/SimpleTrainer';
import Video from '../../utils/Video.js';

import IntroScreen from './IntroScreen';
import TrainingScreen from './TrainingScreen';
import PlayRound from './PlayRound';
import PlayRoundInstructions from './PlayRoundInstructions';
import PlayRoundResult from './PlayRoundResult';

const IMAGE_SIZE = 227;
const CLASS_NAMES = ['rock', 'paper', 'scissors'];

const NO_CLASS = -1;

const ActivityScreen = Object.freeze({
  IntroInstructions: 0,
  TrainClass1: 1,
  TrainClass2: 2,
  TrainClass3: 3,
  PlayRoundInstructions: 4,
  PlayRound: 5,
  PlayRoundResult: 6
});

const defaultState = {
  currentScreen: ActivityScreen.IntroInstructions,
  predictedClass: NO_CLASS,
  confidencesByClassId: [],
  trainingImages0: [],
  trainingImages1: [],
  trainingImages2: [],
  roundResult: null,
  roundPrediction: null
};
module.exports = class Main extends React.Component {
  constructor(props) {
    super(props);
    this.video = new Video(IMAGE_SIZE);
    this.simpleTrainer = new SimpleTrainer();
  }

  state = defaultState;

  componentDidMount() {
    this.simpleTrainer.initializeClassifiers();
  }

  rpsToEmoji(rps) {
    switch (rps) {
      case 'rock':
        return '✊';
      case 'scissors':
        return '✌';
      default:
        return '✋';
    }
  }

  render() {
    return (
      <div>
        {this.state.currentScreen === ActivityScreen.IntroInstructions && (
          <IntroScreen
            onClickContinue={() => {
              this.setState(
                {
                  currentScreen: ActivityScreen.TrainClass1
                },
                null
              );
            }}
          />
        )}
        {this.trainingScreen(0)}
        {this.trainingScreen(1)}
        {this.trainingScreen(2)}
        {this.state.currentScreen === ActivityScreen.PlayRoundInstructions && (
          <PlayRoundInstructions
            onClickContinue={() => {
              this.setState(
                {
                  currentScreen: ActivityScreen.PlayRound
                },
                null
              );
            }}
          />
        )}
        {this.state.currentScreen === ActivityScreen.PlayRound && (
          <PlayRound
            imageSize={IMAGE_SIZE}
            onMountVideo={videoElement => {
              this.video.loadVideo(videoElement);
            }}
            onPlayRound={() => {
              this.playRound().then(() => {
                return this.setState(
                  {
                    currentScreen: ActivityScreen.PlayRoundResult
                  },
                  null
                );
              });
            }}
          />
        )}
        {this.state.currentScreen === ActivityScreen.PlayRoundResult && (
          <PlayRoundResult
            winner={this.state.roundResult.winner}
            confidence={this.state.roundPrediction.confidence}
            playerPlayed={this.state.roundPrediction.playerPlayed}
            playerPlayedImage={this.state.roundPrediction.playerPlayedImage}
            computerPlayed={this.state.roundPrediction.computerPlayed}
            computerPlayedEmoji={this.state.roundPrediction.computerPlayedEmoji}
            onPlayAgain={() => {
              this.setState(
                {
                  currentScreen: ActivityScreen.PlayRound
                },
                null
              );
            }}
            onTrainMore={() => {
              this.setState(
                {
                  currentScreen: ActivityScreen.TrainClass1
                },
                null
              );
            }}
            onContinue={() => {
              this.setState(defaultState, null);
            }}
          />
        )}
      </div>
    );
  }

  trainingScreen(index) {
    const thisScreen = ActivityScreen[`TrainClass${index + 1}`];
    const nextScreen =
      index + 1 >= CLASS_NAMES.length
        ? ActivityScreen.PlayRoundInstructions
        : ActivityScreen[`TrainClass${index + 2}`];
    return (
      this.state.currentScreen === thisScreen && (
        <TrainingScreen
          onTrainClicked={() => {
            this.trainExample(index);
          }}
          onContinueClicked={() => {
            this.setState(
              {
                currentScreen: nextScreen
              },
              null
            );
          }}
          onMountVideo={videoElement => {
            this.video.loadVideo(videoElement);
          }}
          imageSize={IMAGE_SIZE}
          trainingClass={CLASS_NAMES[index]}
          exampleCount={this.simpleTrainer.getExampleCount(index)}
          trainingImages={this.state[`trainingImages${index}`]}
        />
      )
    );
  }

  /**
   * @param {number} index
   * @returns {Promise<void>}
   */
  async trainExample(index) {
    if (this.video.isPlaying()) {
      this.simpleTrainer.addExample(this.video.getVideoElement(), index);
      this.setState({
        ['trainingImages' + index]: this.state['trainingImages' + index].concat(
          this.video.getFrameDataURI()
        )
      });
    }
  }

  async playRound() {
    if (this.video.isPlaying()) {
      if (this.simpleTrainer.getNumClasses() > 0) {
        let frameDataURI = this.video.getFrameDataURI(400);

        let predictionResult = await this.simpleTrainer.predict(
          this.video.getVideoElement()
        );
        let computerChoice = CLASS_NAMES[Math.floor(Math.random() * 3)];
        let playerChoice = CLASS_NAMES[predictionResult.predictedClassId];
        const winner = this.pickWinner(playerChoice, computerChoice);

        this.setState(
          {
            roundPrediction: {
              predictedClass: predictionResult.predictedClassId,
              confidence:
                predictionResult.confidencesByClassId[
                  predictionResult.predictedClassId
                ],
              playerPlayedImage: frameDataURI,

              playerPlayed: playerChoice,
              computerPlayed: computerChoice,
              computerPlayedEmoji: this.rpsToEmoji(computerChoice),

              confidencesByClassId: predictionResult.confidencesByClassId
            },
            roundResult: {
              winner: winner
            }
          },
          null
        );
      }
    }
  }

  pickWinner(playerChoice, computerChoice) {
    return this.beats(playerChoice, computerChoice);
  }

  beats(x, y) {
    const keyBeatsValue = {
      rock: 'scissors',
      paper: 'rock',
      scissors: 'paper'
    };

    return keyBeatsValue[x] === y ? 1 : keyBeatsValue[y] === x ? -1 : 0;
  }
};
