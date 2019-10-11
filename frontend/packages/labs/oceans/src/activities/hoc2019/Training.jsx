import React, {PropTypes} from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import './PondCreator.css';
import {Fish} from './SpritesheetFish';

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
      row.forEach((fish, colIdx) => {
        if (this.state.selectedOptions[rowIdx][colIdx]) {
          this.props.trainer.addExampleData(fish.knnData, 0);
        } else {
          this.props.trainer.addExampleData(fish.knnData, 1);
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
                <Col key={colIdx} xs={6}>
                  <div
                    className="selectable-image-container"
                    onClick={() => this.selectOption(rowIdx, colIdx)}
                  >
                    <Fish
                      body={this.state.visibleOptions[rowIdx][colIdx].body}
                      eye={this.state.visibleOptions[rowIdx][colIdx].eye}
                      mouth={this.state.visibleOptions[rowIdx][colIdx].mouth}
                      sideFin={
                        this.state.visibleOptions[rowIdx][colIdx].sideFin
                      }
                      topFin={this.state.visibleOptions[rowIdx][colIdx].topFin}
                      tail={this.state.visibleOptions[rowIdx][colIdx].tail}
                      colorPalette={this.state.visibleOptions[rowIdx][colIdx].colorPalette}
                      canvasId={
                        this.state.visibleOptions[rowIdx][colIdx].canvasId
                      }
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
