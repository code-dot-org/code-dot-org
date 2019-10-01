import React, {PropTypes} from 'react';
import FishGenerator from './FishGenerator';

export default class PondCreator extends React.Component {
  static propTypes = {
    startingPool: PropTypes.object
  };

  static defaultProps = {
    startingPool: {}
  };

  constructor(props) {
    super(props);
  }

  render() {
    return <FishGenerator canvasId="my-canvas" />;
  }
}
