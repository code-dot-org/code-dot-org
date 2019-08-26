import React from "react";
import SimpleTrainer from "../../utils/SimpleTrainer";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Button from 'react-bootstrap/lib/Button';

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
};

const IMAGE_SIZE = 277;

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
    // return (<div><DndProvider backend={HTML5Backend}>
    //   <Example />
    // </DndProvider></div>);
    // if (!this.state.loaded) {
    //   return <div>Loading machine learning model data...</div>;
    // }
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
          <img className="thumbnail" style={{display: 'inline-block'}} src="images/dog1.png" width={100} height={100}/>
          <img className="thumbnail" style={{display: 'inline-block'}} src="images/dog2.png" width={100} height={100}/>
          <img className="thumbnail" style={{display: 'inline-block'}} src="images/dog3.png" width={100} height={100}/>
        </Col>
      </Row>
      <Row>
        {
          this.state.classes.map((classData, i) => {
            return <Col
              key={i}
              xs={12 / this.state.classes.length}
              style={{
                height: '100px',
                lineHeight: '100px',
                textAlign: 'center',
                border: '2px dashed #f69c55',
                cursor: 'pointer',
                userSelect: 'none'
                // maxWidth: 150,
              }}
              onClick={() => {
                // loadImage("images/dog3.png", IMAGE_SIZE).then((image) => {
                //   this.simpleTrainer.addExample(image, i);
                //   const classes = this.state.classes;
                //   classes[i].examples = this.simpleTrainer.getExampleCount(i);
                //   this.setState({classes: classes});
                // });
              }}
            >
              <Button onClick={() => {
                loadImage("images/dog1.png", IMAGE_SIZE).then((image) => {
                  this.simpleTrainer.addExample(image, i);
                  const classes = this.state.classes;
                  classes[i].examples = this.simpleTrainer.getExampleCount(i);
                  this.setState({classes: classes});
                });
              }}>Image 1</Button>
              <Button onClick={() => {
                loadImage("images/dog3.png", IMAGE_SIZE).then((image) => {
                  this.simpleTrainer.addExample(image, i);
                  const classes = this.state.classes;
                  classes[i].examples = this.simpleTrainer.getExampleCount(i);
                  this.setState({classes: classes});
                });
              }}>Image 3</Button>
              {classData.name}
            </Col>;
          })
        }
        <Button onClick={() => {loadImage("images/dog1.png", IMAGE_SIZE).then((image) => {this.simpleTrainer.predict(image).then((result) => {console.log(result);});});}}>Predict 1</Button>
        <Button onClick={() => {loadImage("images/dog3.png", IMAGE_SIZE).then((image) => {this.simpleTrainer.predict(image).then((result) => {console.log(result);});});}}>Predict 3</Button>
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
