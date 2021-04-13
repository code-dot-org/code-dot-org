import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';

const styles = {
  container: {
    color: color.black,
    textAlign: 'left',
    backgroundColor: color.lighter_gray,
    borderRadius: 5,
    padding: 20,
    margin: 10,
    whiteSpace: 'normal',
    lineHeight: 1.5,
    maxHeight: 'calc(80vh - 140px)',
    overflow: 'scroll'
  },
  subPanel: {
    backgroundColor: color.lightest_gray,
    borderRadius: 5,
    borderColor: color.gray,
    marginBottom: 10,
    padding: 10
  },
  bold: {
    fontFamily: "'Gotham 7r', sans-serif"
  },
  heading: {
    fontFamily: "'Gotham 7r', sans-serif",
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center'
  }
};

export default class ModelCard extends React.Component {
  static propTypes = {
    model: PropTypes.object
  };

  render() {
    const model = this.props.model;
    const metadata = model?.metadata;

    return (
      <div>
        {model && metadata && (
          <div style={styles.container}>
            <h3 style={styles.bold}>{metadata.name}</h3>
            <div style={{marginBottom: 10}}>
              <span style={styles.bold}>Id: </span>
              <span>{this.props.model.id}</span>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Summary</div>
              <p>
                Predict {metadata.labelColumn} based on{' '}
                {metadata.selectedFeatures?.join(', ')} with{' '}
                {metadata.summaryStat?.stat}% accuracy.
              </p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Intended Uses</div>
              <p>{metadata.potentialUses}</p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Warnings</div>
              <p>{metadata.potentialMisuses}</p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Label</div>
              <p>{metadata.labelColumn}</p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Features</div>
              <p>{metadata.selectedFeatures?.join(', ')}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}
