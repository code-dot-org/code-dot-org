import React, {PropTypes} from 'react';
const P5 = require('../../utils/loadP5');
//import {sketch} from '../../utils/sketches';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

export default class P5Canvas extends React.Component {
  static propTypes = {
    fish_data: PropTypes.object.isRequired,
    canvasId: PropTypes.string.isRequired,
    sketch: PropTypes.func.isRequired,
    addExample: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {p5: null};
  }

  componentDidMount() {
    const p5 = new P5(this.props.sketch, this.props.canvasId);
    this.setState({p5: p5});
  }

  render() {
    const {p5} = this.state;
    if (!p5) {
      return null;
    }
    return (
      <div>
        <Col id={this.props.canvasId} xs={6} />
        <Col xs={4}>KNN data: {this.state.p5.getKnnData().join(', ')}</Col>
        <Col xs={2}>
          <Button
            onClick={() =>
              this.props.addExample(this.state.p5.getKnnData(), true)
            }
          >
            Like
          </Button>
          <Button
            onClick={() =>
              this.props.addExample(this.state.p5.getKnnData(), false)
            }
          >
            Dislike
          </Button>
        </Col>
      </div>
    );
  }
}
/*
P5Canvas.propTypes = {
  fish_data: PropTypes.object.isRequired,
  canvasId: PropTypes.string.isRequired,
  //sketch: PropTypes.func.isRequired,
  addExample: PropTypes.func.isRequired
};
*/
