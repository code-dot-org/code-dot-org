import React from "react";
import Col from "react-bootstrap/lib/Col";
import Row from "react-bootstrap/lib/Row";
import Button from "react-bootstrap/lib/Button";
import * as PropTypes from "react/lib/ReactPropTypes";

module.exports = class PlayRoundInstructions extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div>
      <Row>
        <Col xs={12}>
          <p><b>Have you provided enough training data?</b></p>
          <p>Did you take enough photos for the machine learning algorithm to distinguish ROCK from PAPER from SCISSORS?
            Let’s find out!</p>
        </Col>
      </Row>
      <Row>
        <Col
          xs={12}
          style={{textAlign: 'center'}}
        >
          <Button
            style={{marginBottom: 10}}
            onClick={() => {
              this.props.onClickContinue();
            }}
          >
            Try the Game!
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <p>If the computer vision doesn’t seem to work very well, try going back to Train more.</p>
          <p>If it works well, see if it can recognize somebody else’s hand, especially somebody with different skin
            color.</p>
        </Col>
      </Row>
    </div>;
  }

};

module.exports.propTypes = {
  onClickContinue: PropTypes.func
};
