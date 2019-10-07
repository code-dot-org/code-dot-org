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
    /*const numOptions = this.props.numOptions
      ? Math.min(this.props.numOptions, this.props.trainingData.length)
      : this.props.trainingData.length;*/
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
    //const idx = this.state.visibleOptions.findIndex(data => data.id == dataId);
    //const row = this.state.visib;
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
    this.props.trainer.addExampleData(data.knnData, cat);
    this.replaceImage(row, col);
  }

  render() {
    return (
      <div>
        {this.state.visibleOptions.map((row, rowIdx) => (
          <div key={rowIdx}>
            <Row>
              {row.map((data, colIdx) => (
                <Col key={colIdx} xs={4}>
                  <div className="container">
                    <img src={data.imgUrl} />
                    <div className="overlay" />
                    <div className="button like-button">
                      <a onClick={() => this.addExampleAndReplace(data, rowIdx, colIdx, 0)}>
                        {' '}
                        👍{' '}
                      </a>
                    </div>
                    <div className="button dislike-button">
                      <a onClick={() => this.addExampleAndReplace(data, rowIdx, colIdx, 1)}>
                        {' '}
                        👎{' '}
                      </a>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        ))}
      </div>
    );
  }
}
