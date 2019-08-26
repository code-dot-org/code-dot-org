import React from "react";
import SimpleTrainer from "../../utils/SimpleTrainer";
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from 'react-bootstrap/lib/Button';

const ActivityState = Object.freeze({
  Loading: 0,
  Training: 1,
  Playing: 2,
});

const NO_PREDICTION = -1;
const defaultState = {
  classes: [
    {
      name: "Dogs",
      examples: 0
    },
    {
      name: "Cats",
      examples: 0
    },
  ],
  activityState: ActivityState.Loading,
  predictedClass: NO_PREDICTION
};

const activityImages = [
  {guid: "a", url: "images/dog1.png"},
  {guid: "b", url: "images/dog2.png"},
  {guid: "c", url: "images/dog3.png"},
  {guid: "d", url: "images/cat1.jpg"},
  {guid: "e", url: "images/cat2.jpg"},
  {guid: "f", url: "images/cat3.jpg"},
];

const IMAGE_SIZE = 227;

function loadImage(url, size) {
  return new Promise(resolve => {
    const image = new Image();
    image.width = size;
    image.height = size;
    image.addEventListener('load', () => {
      resolve(image);
    });
    image.src = url;
  });
}

module.exports = class ImageRecognition extends React.Component {
  constructor(props) {
    super(props);
    this.simpleTrainer = new SimpleTrainer();
  }

  state = defaultState;

  componentDidMount() {
    this.simpleTrainer.initializeClassifiers().then(() => {
      this.setState({activityState: ActivityState.Training});
    });
  }

  render() {
    if (this.state.activityState === ActivityState.Loading) {
      return <div>Loading machine learning model data...</div>;
    }

    return <div>
      {
        this.state.activityState === ActivityState.Training &&
        <div>
          <Row>
            <Col style={{width: "100%", textAlign: 'center'}} xs={12}>
              <h2>Drag images to train your machine learning algorithm</h2>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <input
                placeholder="🔎 Search term (e.g. 'border collie')"
                style={{
                  width: "100%",
                  textAlign: 'center'
                }}
              >
              </input>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {
                activityImages.map((image, i) => {
                  return (
                    <Draggable
                      key={i}
                      guid={image.guid}
                    >
                      <img
                        // onMouseOver={() => {
                        //   loadImage(image.url, IMAGE_SIZE).then((img) => {
                        //     this.simpleTrainer.predict(img).then((result) => {
                        //       console.log(result);
                        //     });
                        //   });
                        // }}
                        src={image.url}
                        className="thumbnail"
                        style={{
                          display: 'inline-block'
                        }}
                        width={100}
                        height={100}
                      />
                    </Draggable>
                  );
                })
              }
            </Col>
          </Row>
          <Row>
            {
              this.state.classes.map((classData, i) => {
                return (
                  <Col
                    key={i}
                    xs={12 / this.state.classes.length}
                    style={{
                      height: '100px',
                      lineHeight: '100px',
                      textAlign: 'center',
                      border: '2px dashed #f69c55',
                      userSelect: 'none'
                    }}
                  >
                    <Droppable
                      onDrop={(guid) => {
                        const image = activityImages.find(e => {
                          return e.guid === guid;
                        });
                        loadImage(image.url, IMAGE_SIZE).then((image) => {
                          this.simpleTrainer.addExample(image, i);
                          this.updateExampleCounts(i);
                        });
                      }}
                    >
                      {classData.name}
                    </Droppable>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "0",
                        lineHeight: "initial",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      {classData.examples.toString()}
                    </div>
                  </Col>
                );
              })
            }
          </Row>
        </div>
      }
      {
        this.state.activityState === ActivityState.Training &&
        <Row>
          <Col
            xs={12}
            style={{marginTop: 10, textAlign: 'center'}}
          >
            <Button onClick={() => {this.setState({activityState: ActivityState.Playing});}}>Try the Model!</Button>
            <Button
              onClick={() => {
                this.simpleTrainer.clearAll();
                this.resetAllExampleCounts();
              }}
            >
              Reset Training
            </Button>
          </Col>
        </Row>
      }
      {
        this.state.activityState === ActivityState.Playing &&
        <Row>
          <Col style={{textAlign: 'center'}} xs={12}>
            <h3>Tap an image to classify it</h3>
            {
              activityImages.map((image, i) => {
                return (
                  <Draggable
                    key={i}
                    guid={image.guid}
                  >
                    <img
                      // onMouseOver={() => {
                      //   loadImage(image.url, IMAGE_SIZE).then((img) => {
                      //     this.simpleTrainer.predict(img).then((result) => {
                      //       console.log(result);
                      //     });
                      //   });
                      // }}
                      src={image.url}
                      className="thumbnail"
                      style={{
                        display: 'inline-block'
                      }}
                      width={100}
                      height={100}
                    />
                  </Draggable>
                );
              })
            }
          </Col>
        </Row>
      }
      {
        this.state.activityState === ActivityState.Playing &&
        <Row>
          <Col
            xs={12}
            style={{marginTop: 10, textAlign: 'center'}}
          >
            <Button onClick={() => {this.setState({activityState: ActivityState.Training});}}>Train More</Button>
          </Col>
        </Row>
      }
    </div>
    ;
  }

  resetAllExampleCounts() {
    const classes = this.state.classes;
    this.state.classes.forEach((c, i) => {
      classes[i].examples = 0;
    });
    this.setState({classes: classes});
  }

  async updateExampleCounts(i) {
    const classes = this.state.classes;
    classes[i].examples = this.simpleTrainer.getExampleCount(i);
    return this.setState({classes: classes});
  }

  async playRound() {
    if (this.video.isPlaying()) {
      if (this.simpleTrainer.getNumClasses() > 0) {
        let frameDataURI = this.video.getFrameDataURI(400);

        let predictionResult = await this.simpleTrainer.predict(this.video.getVideoElement());
        this.setState({
          lastPrediction: {
            predictedClass: predictionResult.predictedClassId,
            confidence: predictionResult.confidencesByClassId[predictionResult.predictedClassId],
            playerPlayedImage: frameDataURI,
            confidencesByClassId: predictionResult.confidencesByClassId,
          },
        }, null);
      }
    }
  }
};
