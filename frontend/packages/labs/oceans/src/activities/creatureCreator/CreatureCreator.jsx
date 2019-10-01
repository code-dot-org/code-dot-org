import React from 'react';
import {fish} from './sketches';
import Button from 'react-bootstrap/lib/Button';
const P5 = require('./loadP5');

const CANVAS_ID = 'p5-canvas';

export default class CreatureCreator extends React.Component {
  componentDidMount() {
    this.p5 = new P5(fish, CANVAS_ID);
  }

  download = () => {
    this.p5.download(CANVAS_ID);
  };

  render() {
    return (
      <div>
        <div id={CANVAS_ID} />
        <br />
        <br />
        <Button onClick={() => this.download()}>Download as .png</Button>
      </div>
    );
  }
}
