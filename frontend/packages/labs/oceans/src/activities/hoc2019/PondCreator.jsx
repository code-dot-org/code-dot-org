import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Image from 'react-bootstrap/lib/Image';
import Button from 'react-bootstrap/lib/Button';
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
