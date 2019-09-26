import React from 'react';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import * as PropTypes from 'react/lib/ReactPropTypes';

module.exports = class PlayRound extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    countdownNumber: 3
  };

  componentDidMount() {
    setTimeout(() => this.decrementCountdown(), 1000);
    setTimeout(() => this.decrementCountdown(), 2000);
    setTimeout(() => this.decrementCountdown(), 3000);
    setTimeout(() => this.props.onPlayRound(), 3500);
  }

  componentWillUnmount() {
    console.log('unounting');
    this.hasMounted = false;
  }

  decrementCountdown() {
    this.setState({countdownNumber: this.state.countdownNumber - 1});
  }

  render() {
    return (
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
        <Col xs={12} style={{textAlign: 'center'}}>
          <h1>
            {this.state.countdownNumber <= 3 && `3...`}{' '}
            {this.state.countdownNumber <= 2 && `2...`}{' '}
            {this.state.countdownNumber <= 1 && `1...`}
          </h1>
        </Col>
      </Row>
    );
  }
};

module.exports.propTypes = {
  onPlayRound: PropTypes.func,
  onMountVideo: PropTypes.func,
  imageSize: PropTypes.number
};
