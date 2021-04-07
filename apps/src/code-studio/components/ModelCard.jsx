import PropTypes from 'prop-types';
import React from 'react';
import $ from 'jquery';
import color from '@cdo/apps/util/color';

const styles = {
  container: {
    color: color.black,
    textAlign: 'left',
    backgroundColor: color.lighter_gray,
    borderRadius: 5,
    padding: 20,
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
    modelId: PropTypes.string
  };

  state = {
    metadata: [],
    isLoadPending: false
  };

  componentDidUpdate(prevProps) {
    if (this.props.modelId !== prevProps.modelId) {
      this.setState({metadata: undefined});
      this.getModelMetadata();
    }
  }

  getModelMetadata = () => {
    if (this.props.modelId) {
      this.setState({isImportPending: true});
      $.ajax({
        url: '/api/v1/ml_models/' + this.props.modelId + '/metadata',
        method: 'GET',
        dataType: 'json'
      })
        .done(metadata => {
          this.setState({isImportPending: false, metadata});
        })
        .fail(e => {
          console.log(e);
          this.setState({isImportPending: false, metadata: undefined});
        });
    }
  };

  render() {
    const modelId = this.props.modelId;
    const metadata = this.state.metadata;

    return (
      <div>
        {modelId && metadata && (
          <div style={styles.container}>
            <h3 style={styles.bold}>{metadata.name}</h3>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Summary</div>
              <p>
                Predict {metadata.labelColumn} based on
                {metadata.selectedFeatures?.join(', ')} with
                {metadata.summaryStat?.stat}% accuracy.
              </p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>About the Data</div>
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
