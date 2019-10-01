import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import FishGenerator from './FishGenerator';

const FISH_COUNT = 9;

export default class PondCreator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fish: this.generateFish()
    };
  }

  generateFish = () => {
    let fish = {};
    for (let i = 0; i < FISH_COUNT; i++) {
      const canvasId = `fish-canvas-${i}`;
      const knnData = [];
      fish[canvasId] = knnData;
    }

    return fish;
  };

  registerKnnData = canvasId => {
    console.log(canvasId);
  };

  render() {
    return (
      <div>
        {Object.keys(this.state.fish).map(canvasId => (
          <Row key={canvasId}>
            <Col xs={6}>
              <FishGenerator
                canvasId={canvasId}
                registerKnnData={this.registerKnnData}
              />
            </Col>
            <Col xs={6}>KNN data: {this.state.fish[canvasId]}</Col>
          </Row>
        ))}
      </div>
    );
  }
}
