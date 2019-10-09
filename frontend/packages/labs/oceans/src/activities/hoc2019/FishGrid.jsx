import React, {PropTypes} from 'react';
import {fishShape} from '../../utils/fishData';
import {Fish} from './SpritesheetFish';
import _ from 'lodash';

export default class FishGrid extends React.Component {
  static propTypes = {
    fishData: PropTypes.arrayOf(
      PropTypes.shape({
        fish: fishShape.isRequired,
        isSelected: PropTypes.bool,
        label: PropTypes.string
      })
    ).isRequired,
    cols: PropTypes.number.isRequired,
    canSelect: PropTypes.bool,
    onSelectFish: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      rows: _.chunk(props.fishData, props.cols),
      selectedImages: {}
    };
  }

  onSelectFish = (rowIdx, colIdx) => {
    if (!this.props.canSelect || this.state.rows[rowIdx][colIdx].isSelected) {
      return;
    }

    let updatedRows = [...this.state.rows];
    updatedRows[rowIdx][colIdx].isSelected = true;
    this.setState({rows: updatedRows});

    if (this.props.onSelectFish) {
      this.props.onSelectFish();
    }
  };

  render() {
    return (
      <div>
        {this.state.rows.map((row, rowIdx) => (
          <div key={`row-${rowIdx}`} style={styles.row}>
            {row.map((fishDatum, colIdx) => (
              <div
                onClick={() => this.onSelectFish(rowIdx, colIdx)}
                style={styles.col}
                key={`col-${colIdx}`}
              >
                <Fish {...fishDatum.fish} />
                {fishDatum.isSelected && fishDatum.label && (
                  <span style={styles.label}>{fishDatum.label}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

const styles = {
  row: {
    display: 'flex'
  },
  col: {
    position: 'relative',
    margin: 10
  },
  img: {
    width: 200,
    height: 200
  },
  label: {
    backgroundColor: 'coral',
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '5px 10px'
  }
};
