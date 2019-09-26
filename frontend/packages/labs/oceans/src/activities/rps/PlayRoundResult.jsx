import React from 'react';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import * as PropTypes from 'react/lib/ReactPropTypes';

module.exports = class PlayRound extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} style={{textAlign: 'center'}}>
            <h2>
              {this.props.winner > 0
                ? 'YOU WIN! 🙌'
                : this.props.winner === 0
                ? 'DRAW 🤷‍♀️'
                : 'YOU LOSE 😭'}
            </h2>
          </Col>
        </Row>
        <Row>
          <Col sm={6} style={{textAlign: 'right'}}>
            <p>
              <b>You:</b>
            </p>
            <img src={this.props.playerPlayedImage} width={150} height={150} />
            <p>
              {this.props.playerPlayed} (
              {Math.floor(this.props.confidence * 100)}% sure)
            </p>
          </Col>
          <Col sm={6}>
            <p>
              <b>Computer:</b>
            </p>
            <p
              style={{
                fontSize: 100
              }}
            >
              {this.props.computerPlayedEmoji}
            </p>
            <p>{this.props.computerPlayed}</p>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Button className="pull-right" onClick={this.props.onPlayAgain}>
              Play Again
            </Button>
          </Col>
          <Col sm={6}>
            <Button className="pull-left" onClick={this.props.onTrainMore}>
              Train More
            </Button>
          </Col>
        </Row>
        <Row style={{marginTop: 10}}>
          <Col xs={12} style={{textAlign: 'center'}}>
            <Button onClick={this.props.onContinue}>Continue</Button>
          </Col>
        </Row>
      </div>
    );
  }
};

module.exports.propTypes = {
  onPlayAgain: PropTypes.func,
  onTrainMore: PropTypes.func,
  onContinue: PropTypes.func,
  roundResult: PropTypes.object,

  confidence: PropTypes.number,

  playerPlayed: PropTypes.string,
  playerPlayedImage: PropTypes.string,
  computerPlayed: PropTypes.string,
  computerPlayedEmoji: PropTypes.string,

  winner: PropTypes.number
};
