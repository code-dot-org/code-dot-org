import React from 'react';
import {fish} from '../../utils/sketches';
import {COLORS} from '../../utils/colors';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {CirclePicker} from 'react-color';
const P5 = require('../../utils/loadP5');

const CANVAS_ID = 'p5-canvas';

export default class CreatureCreator extends React.Component {
  componentDidMount() {
    this.p5 = new P5(fish, CANVAS_ID);
  }

  download = () => {
    this.p5.download(CANVAS_ID);
  };

  onBodySizeChange = () => {
    var bodyWidth = parseInt(document.getElementById('bodyWidthSlider').value);
    var bodyHeight = parseInt(
      document.getElementById('bodyHeightSlider').value
    );
    this.p5.setBodySize(bodyWidth, bodyHeight);
  };

  onEyeSizeChange = () => {
    var eyeDiameter = parseInt(
      document.getElementById('eyeDiameterSlider').value
    );
    this.p5.setEyeSize(eyeDiameter);
  };

  onTailSizeChange = () => {
    var tailHeightPercent =
      parseInt(document.getElementById('tailHeightSlider').value) / 100;
    this.p5.setTailSizeRelativeToBody(tailHeightPercent);
  };

  onTopFinSizeChange = () => {
    var widthPercent =
      parseInt(document.getElementById('topFinWidthSlider').value) / 100;
    var heightPercent =
      parseInt(document.getElementById('topFinHeightSlider').value) / 100;
    this.p5.setTopFinSizeRelativeToBody(widthPercent, heightPercent);
  };

  onSideFinSizeChange = () => {
    var widthPercent =
      parseInt(document.getElementById('sideFinWidthSlider').value) / 100;
    var heightPercent =
      parseInt(document.getElementById('sideFinHeightSlider').value) / 100;
    this.p5.setSideFinSizeRelativeToBody(widthPercent, heightPercent);
  };

  render() {
    return (
      <div>
        <Row>
          <Col xs={3}>
            Body Width:
            <input
              id="bodyWidthSlider"
              type="range"
              min="60"
              max="200"
              step="1"
              onChange={() => this.onBodySizeChange()}
              style={{width: '200px'}}
            />
          </Col>
          <Col xs={3}>
            Body Height
            <input
              id="bodyHeightSlider"
              type="range"
              min="50"
              max="200"
              step="1"
              onChange={() => this.onBodySizeChange()}
              style={{width: '200px'}}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            Body Color
            <CirclePicker
              colors={COLORS}
              circleSize={10}
              circleSpacing={4}
              onChange={color => this.p5.setBodyColor(color.hex)}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            Eye Diameter
            <input
              id="eyeDiameterSlider"
              type="range"
              min="5"
              max="50"
              step="1"
              onChange={() => this.onEyeSizeChange()}
              style={{width: '200px'}}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            Fin Color
            <CirclePicker
              colors={COLORS}
              circleSize={10}
              circleSpacing={4}
              onChange={color => this.p5.setFinColor(color.hex)}
              height={100}
            />
          </Col>
        </Row>
        <Row>
         <Col xs={3}>
            Tail Height
            <input
              id="tailHeightSlider"
              type="range"
              min="10"
              max="100"
              step="1"
              onChange={() => this.onTailSizeChange()}
              style={{width: '200px'}}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            Top Fin Width:
            <input
              id="topFinWidthSlider"
              type="range"
              min="5"
              max="50"
              step="1"
              onChange={() => this.onTopFinSizeChange()}
              style={{width: '200px'}}
            />
          </Col>
          <Col xs={3}>
            Top Fin Height
            <input
              id="topFinHeightSlider"
              type="range"
              min="10"
              max="100"
              step="1"
              onChange={() => this.onTopFinSizeChange()}
              style={{width: '200px'}}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={3}>
            Side Fin Width:
            <input
              id="sideFinWidthSlider"
              type="range"
              min="5"
              max="50"
              step="1"
              onChange={() => this.onSideFinSizeChange()}
              style={{width: '200px'}}
            />
          </Col>
          <Col xs={3}>
            Side Fin Height
            <input
              id="sideFinHeightSlider"
              type="range"
              min="10"
              max="100"
              step="1"
              onChange={() => this.onSideFinSizeChange()}
              style={{width: '200px'}}
            />
          </Col>
        </Row>

        <div id={CANVAS_ID} />
        <br />
        <br />
        <Button onClick={() => this.download()}>Download as .png</Button>
      </div>
    );
  }
}
