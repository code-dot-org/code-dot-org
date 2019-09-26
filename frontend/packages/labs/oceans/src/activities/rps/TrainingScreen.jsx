import React from 'react';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import * as PropTypes from 'react/lib/ReactPropTypes';

module.exports = class TrainingScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.hasMounted = false;
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <p>
              <b>
                “Train” the computer to see{' '}
                {this.props.trainingClass.endsWith('s') ? '' : 'a'}{' '}
                {this.props.trainingClass}
              </b>
            </p>
            <p>
              Show a rock, and click Train to take photos, so the machine
              learning algorithm can “learn” how to recognize a rock.
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={12} style={{textAlign: 'center'}}>
            <video
              ref={el => {
                if (this.hasMounted) {
                  return;
                }
                this.props.onMountVideo(el);
                this.hasMounted = true;
              }}
              autoPlay=""
              playsInline=""
              width={this.props.imageSize}
              height={this.props.imageSize}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} style={{textAlign: 'center'}}>
            <Button
              onClick={() => {
                this.props.onTrainClicked();
              }}
            >
              Train {this.props.trainingClass}
            </Button>
          </Col>
        </Row>
        <Row style={{marginTop: 20, minHeight: 60}}>
          <Col xs={12}>
            {this.props.trainingImages.map((image, i) => {
              return (
                <img
                  className="thumbnail"
                  style={{display: 'inline-block'}}
                  key={i}
                  src={image}
                  width={40}
                  height={40}
                />
              );
            })}
          </Col>
        </Row>
        {this.props.trainingImages && this.props.trainingImages.length > 0 && (
          <Row style={{marginTop: 10}}>
            <Col xs={12} style={{textAlign: 'center'}}>
              <Button
                onClick={() => {
                  this.props.onContinueClicked();
                }}
              >
                Continue
              </Button>
            </Col>
          </Row>
        )}
      </div>
    );
  }
};

module.exports.propTypes = {
  onMountVideo: PropTypes.func,
  onTrainClicked: PropTypes.func,
  onContinueClicked: PropTypes.func,
  imageSize: PropTypes.number,
  trainingClass: PropTypes.string,

  exampleCount: PropTypes.number,
  trainingImages: PropTypes.arrayOf(PropTypes.string)
};
