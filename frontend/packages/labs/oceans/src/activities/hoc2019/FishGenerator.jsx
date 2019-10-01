import React, {PropTypes} from 'react';
import {fish} from '../../utils/sketches';
const P5 = require('../../utils/loadP5'); // pass in as prop?

export default class FishGenerator extends React.Component {
  static propTypes = {
    canvasId: PropTypes.string.isRequired,
    registerKnnData: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.p5 = new P5(fish, this.props.canvasId);
  }

  render() {
    return <div id={this.props.canvasId} />;
  }
}
