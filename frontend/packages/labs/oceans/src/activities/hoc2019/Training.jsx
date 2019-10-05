import React, {PropTypes} from 'react';
import Button from 'react-bootstrap/lib/Button';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import SimpleTrainer from '../../utils/SimpleTrainer';
import P5Canvas from './P5Canvas';
import {COLORS} from '../../utils/colors';
import './PondCreator.css';

export default class Training extends React.Component {
  static propTypes = {
    trainingData: PropTypes.array.isRequired,
    trainer: PropTypes.object.isRequired,
    numOptions: PropTypes.number
  };

  constructor(props) {
    super(props);
    const numOptions = this.props.numOptions
      ? Math.min(this.props.numOptions, this.props.trainingData.length)
      : this.props.trainingData.length;

    this.state = {
      numOptions: numOptions,
      trainingDataPos: numOptions,
      visibleOptions: this.props.trainingData.slice(0, numOptions)
    };
  }

  replaceImage(dataId) {
    const idx = this.state.visibleOptions.findIndex(data => data.id == dataId);
    const newImage = this.props.trainingData[this.state.trainingDataPos];
    const newTrainingDataPos = this.state.trainingDataPos + 1;
    const newVisibleOptions = this.state.visibleOptions;
    if (newImage) {
    newVisibleOptions.splice(idx, 1, newImage);
        } else {
      newVisibleOptions.splice(idx, 1);
    }
    this.setState({
      visibleOptions: newVisibleOptions,
      trainingDataPos: newTrainingDataPos
    });

  }

  addExampleAndReplace(data, cat) {
    this.props.trainer.addExampleData(data.knnData, cat);
    this.replaceImage(data.id);
  }

  render() {
    return (
      <div>
        {this.state.visibleOptions.map(data => (
          <div key={data.id}>
            <Row>
              <Col>
                <div className="container">
                  <img
                    src={data.imgUrl}
                  />
                  <div className="overlay" />
                  <div className="button like-button">
                    <a onClick={() => this.addExampleAndReplace(data, 0)}> 👍 </a>
                  </div>
                  <div className="button dislike-button">
                    <a onClick={() => this.addExampleAndReplace(data,1)}> 👎 </a>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    );
  }
}
