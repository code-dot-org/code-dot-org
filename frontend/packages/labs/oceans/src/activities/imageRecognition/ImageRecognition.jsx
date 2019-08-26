import React from "react";
import SimpleTrainer from "../../utils/SimpleTrainer";
import Draggable from "./Draggable";
import Droppable from "./Droppable";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from 'react-bootstrap/lib/Button';

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
      this.setState({
        loaded: true
      });
    });
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading machine learning model data...</div>;
    }

    return <div>
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
                      const classes = this.state.classes;
                      classes[i].examples = this.simpleTrainer.getExampleCount(i);
                      this.setState({classes: classes});
                    });
                  }}
                >
                  {classData.name}
                </Droppable>
              </Col>
            );
          })
        }
        <Button onClick={() => {
          loadImage("images/dog1.png", IMAGE_SIZE).then((image) => {
            this.simpleTrainer.predict(image).then((result) => {
              console.log(result);
            });
          });
        }}>Predict 1</Button>
        <Button onClick={() => {
          loadImage("images/cat1.jpg", IMAGE_SIZE).then((image) => {
            this.simpleTrainer.predict(image).then((result) => {
              console.log(result);
            });
          });
        }}>Predict 3</Button>
      </Row>
      <Row>
        <Col xs={12}>
          <p><b>Training Data:</b></p>
          {
            this.state.classes.map((classData, i) => {
              return <div
                key={i}
              >
                {classData.name} - {classData.examples}
              </div>;
            })
          }
        </Col>
      </Row>
    </div>
    ;
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
