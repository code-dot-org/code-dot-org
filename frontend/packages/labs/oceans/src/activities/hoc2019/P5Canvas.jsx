import React, {PropTypes} from 'react';
const P5 = require('../../utils/loadP5');
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

export default class P5Canvas extends React.Component {
  static propTypes = {
    fishData: PropTypes.object.isRequired,
    canvasId: PropTypes.string.isRequired,
    sketch: PropTypes.func.isRequired,
    addExample: PropTypes.func,
    isSelectable: PropTypes.bool,
    showPrediction: PropTypes.bool,
    getPrediction: PropTypes.func, // returns a promise
    getClassTypeString: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {p5: null, predictedClass: null};
  }

  componentDidMount() {
    const p5 = new P5(this.props.sketch, this.props.canvasId);
    p5.setPartialData(this.props.fishData);
    this.setState({p5});
    if (this.props.showPrediction) {
      this.predictClass(p5);
    }
  }

  predictClass(p5) {
    this.props.getPrediction(p5.getKnnData()).then(res => {
      this.setState({predictedClass: res.predictedClassId});
    });
  }

  render() {
    const {p5} = this.state;

    return (
      <div>
        <Col id={this.props.canvasId} xs={6} />
        {p5 && (
          <div>
            {this.props.isSelectable && (
              <div>
                <Col xs={4}>
                  KNN data: {this.state.p5.getKnnData().join(', ')}
                </Col>
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
            )}
            {this.props.showPrediction && (
              <Col xs={4}>Prediction: {this.props.getClassTypeString(this.state.predictedClass)}</Col>
            )}
          </div>
        )}
      </div>
    );
  }
}
