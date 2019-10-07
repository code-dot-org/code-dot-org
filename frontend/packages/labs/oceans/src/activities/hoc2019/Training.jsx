import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import './PondCreator.css';

export default class Training extends React.Component {
  static propTypes = {
    trainingData: PropTypes.array.isRequired,
    trainer: PropTypes.object.isRequired,
    rows: PropTypes.number.isRequired,
    cols: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    var trainingDataPos = 0;
    // What are the options on the screen?
    const visibleOptions = new Array(props.rows);
    // Keeps track of the current category of the option. Currently implemented
    // using booleans but could hold an enum value if we wanted more categories.
    const selectedOptions = new Array(props.rows);
    for (var i = 0; i < props.rows; ++i) {
      visibleOptions[i] = this.props.trainingData.slice(
        trainingDataPos,
        trainingDataPos + props.cols
      );
      trainingDataPos += props.cols;
      selectedOptions[i] = new Array(props.cols);
      selectedOptions[i].fill(false, 0, props.cols);
    }

    this.state = {
      visibleOptions: visibleOptions,
      selectedOptions: selectedOptions
    };
  }

  selectOption(row, col) {
    const selectedOptions = this.state.selectedOptions;
    if (selectedOptions[row][col]) {
      return;
    }
    selectedOptions[row][col] = true;
    this.setState({selectedOptions});
  }

  componentWillUnmount() {
    this.state.visibleOptions.forEach((row, rowIdx) => {
      row.forEach((option, colIdx) => {
        if (this.state.selectedOptions[rowIdx][colIdx]) {
          this.props.trainer.addExampleData(option.knnData, 0);
        } else {
          this.props.trainer.addExampleData(option.knnData, 1);
        }
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
                  <div className="selectable-image-container">
                    <img
                      src={data.imgUrl}
                      onClick={() => this.selectOption(rowIdx, colIdx)}
                    />
                    {this.state.selectedOptions[rowIdx][colIdx] && (
                      <div className="top-right-label">{this.props.label}</div>
                    )}
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
