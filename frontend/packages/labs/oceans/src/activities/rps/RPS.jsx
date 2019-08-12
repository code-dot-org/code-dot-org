/**
 * RPS Activity. Based off of:
 * - https://github.com/ryansloan/rps-ml
 * - https://github.com/googlecreativelab/teachable-machine-boilerplate
 */

import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

import SimpleTrainer from '../../utils/SimpleTrainer';
import Video from '../../utils/Video.js';

const IMAGE_SIZE = 227;
const NUM_CLASSES = 3;
const CLASS_NAMES = ['rock', 'paper', 'scissors'];

const MIN_EXAMPLES = 20;
const NO_CLASS = -1;

module.exports = class Main extends React.Component {
  constructor(props) {
    super(props);
    this.videoElementRef = null;
    this.video = new Video(IMAGE_SIZE);
    this.simpleTrainer = new SimpleTrainer();
  }

  state = {
    predictedClass: NO_CLASS,
    confidencesByClassId: [],
    trainingImages0: [],
    trainingImages1: [],
    trainingImages2: [],
    roundResult: null
  };

  componentDidMount() {
    this.simpleTrainer.initializeClassifiers();
    this.video.loadVideo(this.videoElementRef);
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
    return <div>
      <Row style={{
        display: 'flex',
        alignItems: 'center',
      }}>
        <Col sm={6}>
          <video ref={(el) => this.videoElementRef = el} autoPlay="" playsInline="" width={IMAGE_SIZE} height={IMAGE_SIZE}/>
        </Col>
        <Col sm={6}>
          <Button bsSize="large"
            onClick={() => this.playRound()}
          >
            Play Round
          </Button>
        </Col>
      </Row>
      <Row>
        <Col>
          <div style={{marginBottom: 10}}>
            <i>Click each &lsquo;train&rsquo; button to train the computer on one frame from your camera</i><br/>
          </div>
          {!!this.state.roundResult && <div style={{marginBottom: 10}}>
            {`You played...${this.rpsToEmoji(this.state.roundResult.playerPlayed)}`}<br/>
            {`Computer played ${this.rpsToEmoji(this.state.roundResult.computerPlayed)}`}<br/>
            {this.state.roundResult.winner > 0 ? 'YOU WIN' : this.state.roundResult.winner === 0 ? 'DRAW' : 'YOU LOSE'}
          </div>}

          {
            [...Array(NUM_CLASSES).keys()].map((index) => {
              let exampleCount = this.simpleTrainer.getExampleCount(index);
              let confidence = this.state.confidencesByClassId[index] * 100;
              return (<div key={index.toString()} style={{marginBottom: "10px"}}>
                <Button
                  onClick={() => {
                    this.trainExample(index);
                  }}
                >
                  Train {CLASS_NAMES[index]}
                </Button>
                {!confidence && !!exampleCount && <span style={{fontWeight: this.state.predictedClass === index ? "bold" : "normal"}}>
                  {
                    `${exampleCount} example${ exampleCount !== 1 ? 's' : '' } ${(exampleCount >= MIN_EXAMPLES ? '✅' : '')}`
                  }
                </span>}
                {!!confidence && <span style={{fontWeight: this.state.predictedClass === index ? "bold" : "normal"}}>
                  {
                    ` ${exampleCount} example${ exampleCount !== 1 ? 's' : '' } - ${confidence}%`
                  }
                </span>}
                {
                  this.state['trainingImages' + index].map((image, i) => {
                    return <img key={i} src={image} width={40} height={40}/>;
                  })
                }
              </div>);
            })
          }
        </Col>
      </Row>
    </div>;
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
        let predictionResult = await this.simpleTrainer.predict(this.video.getVideoElement());
        this.setState({
          predictedClass: predictionResult.predictedClassId,
          confidencesByClassId: predictionResult.confidencesByClassId
        }, () => {
          let computerChoice = CLASS_NAMES[Math.floor(Math.random() * 3)];
          let playerChoice = CLASS_NAMES[this.state.predictedClass];
          const winner = this.pickWinner(playerChoice, computerChoice);
          this.setState({
            roundResult: {
              winner: winner,
              playerPlayed: playerChoice,
              computerPlayed: computerChoice
            }
          }, null);
        });
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

    return keyBeatsValue[x] === y ? 1 :
      keyBeatsValue[y] === x ? -1 :
        0;
  }
};
