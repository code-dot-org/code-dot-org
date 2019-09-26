import React from 'react';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';
import * as PropTypes from 'react/lib/ReactPropTypes';

module.exports = class IntroScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <p>Train a computer to “see” Rock, Paper, Scissors</p>
          <p>
            On the next screen, you’ll be prompted to let your browser to access
            the camera. Please click “Allow”
          </p>
          <Button
            style={{marginBottom: 10}}
            onClick={() => {
              this.props.onClickContinue();
            }}
          >
            Continue
          </Button>
          <p>
            <b>If your device doesn’t have a camera:</b>
          </p>
          <p>
            Visit code.org/ai from using a modern smartphone that has a camera.
          </p>
          <p>
            <b>What is the camera access for?:</b>
          </p>
          <p>You’ll be “training” a computer vision algorithm.</p>
          <p>
            None of the images seen by the camera will ever leave your computer
            or be shared or stored by anybody. They’ll be used only for this
            tutorial and deleted after you leave this web page.
          </p>
        </Col>
      </Row>
    );
  }
};

module.exports.propTypes = {
  onClickContinue: PropTypes.func
};
