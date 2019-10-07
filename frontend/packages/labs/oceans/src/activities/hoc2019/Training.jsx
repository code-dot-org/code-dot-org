import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import './PondCreator.css';

export default class Training extends React.Component {
  static propTypes = {
    trainingData: PropTypes.array.isRequired,
    trainer: PropTypes.object.isRequired,
    rows: PropTypes.number,
    cols: PropTypes.number
  };

  constructor(props) {
    super(props);
    var trainingDataPos = 0;
    const visibleOptions = new Array(props.rows);
    for (var i = 0; i < props.rows; ++i) {
      visibleOptions[i] = this.props.trainingData.slice(
        trainingDataPos,
        trainingDataPos + props.cols
      );
      trainingDataPos += props.cols;
    }
    console.log(visibleOptions);

    this.state = {
      trainingDataPos: trainingDataPos,
      visibleOptions: visibleOptions
    };
  }

  replaceImage(row, col) {
    const newImage = this.props.trainingData[this.state.trainingDataPos];
    const newTrainingDataPos = this.state.trainingDataPos + 1;
    const newVisibleOptions = this.state.visibleOptions;
    if (newImage) {
      newVisibleOptions[row].splice(col, 1, newImage);
    } else {
      newVisibleOptions[row].splice(col, 1);
    }
    this.setState({
      visibleOptions: newVisibleOptions,
      trainingDataPos: newTrainingDataPos
    });
  }

  addExampleAndReplace(data, row, col, cat) {
    this.props.trainer.addExampleData(data.knnData, 0);
    this.replaceImage(row, col);
  }

  componentWillUnmount() {
    this.state.visibleOptions.forEach(row => {
      row.forEach(option => {
        this.props.trainer.addExampleData(option.knnData, 1);
      });
    });
  }

  render() {
    return (
      <div>
        {this.state.visibleOptions.map((row, rowIdx) => (
          <div key={rowIdx}>
            <Row>
              {row.map((data, colIdx) => (
                <Col key={colIdx} xs={4}>
                  <img
                    src={data.imgUrl}
                    onClick={() =>
                      this.addExampleAndReplace(data, rowIdx, colIdx)
                    }
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </div>
    );
  }
}
