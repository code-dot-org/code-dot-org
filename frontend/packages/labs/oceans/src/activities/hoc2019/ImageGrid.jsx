import React, {PropTypes} from 'react';
import _ from 'lodash';

export default class ImageGrid extends React.Component {
  static propTypes = {
    images: PropTypes.array.isRequired,
    cols: PropTypes.number.isRequired,
    label: PropTypes.string,
    onSelectImage: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      rows: _.chunk(props.images, props.cols),
      selectedImages: {}
    };
  }

  onSelectImage = (rowIdx, colIdx) => {
    let selectedImages = {...this.state.selectedImages};
    let selectedInRow = selectedImages[rowIdx] || [];

    if (!selectedInRow.includes(colIdx)) {
      selectedInRow.push(colIdx);
      selectedImages[rowIdx] = selectedInRow;
      this.setState({selectedImages});

      if (this.props.onSelectImage) {
        this.props.onSelectImage();
      }
    }
  };

  isSelected = (rowIdx, colIdx) => {
    return (this.state.selectedImages[rowIdx] || []).includes(colIdx);
  };

  render() {
    return (
      <div>
        {this.state.rows.map((row, rowIdx) => (
          <div key={`row-${rowIdx}`} style={styles.row}>
            {row.map((image, colIdx) => (
              <div
                onClick={() => this.onSelectImage(rowIdx, colIdx)}
                style={styles.col}
                key={`col-${colIdx}`}
              >
                <img src={image} style={styles.img} />
                {this.props.label && this.isSelected(rowIdx, colIdx) && (
                  <span style={styles.label}>{this.props.label}</span>
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
