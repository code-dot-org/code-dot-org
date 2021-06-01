import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';

class FeatureDetails extends React.Component {
  static propTypes = {
    feature: PropTypes.object
  };

  render() {
    const {feature} = this.props;

    return (
      <div>
        <p style={styles.bold}>{feature.id}</p>
        <p>{feature.description}</p>
        <div>
          Possible Values:{' '}
          {!feature.values && (
            <p style={styles.details}>
              min: {feature.min}, max: {feature.max}
            </p>
          )}
          {feature.values && feature.values.join(', ')}
        </div>
        <br />
      </div>
    );
  }
}

export default class ModelCard extends React.Component {
  static propTypes = {
    model: PropTypes.object
  };

  render() {
    const model = this.props.model;
    const metadata = model?.metadata;
    const selectedFeatures = metadata?.features.map(feature => {
      return feature.id;
    });

    return (
      <div>
        {model && metadata && (
          <div style={styles.container}>
            <h3 style={styles.header}>{metadata.name}</h3>
            <div>
              <span style={styles.bold}>Id: </span>
              <span>{this.props.model.id}</span>
            </div>
            <br />
            <div style={styles.subPanel}>
              <div style={styles.heading}>Summary</div>
              <p style={styles.details}>
                Predict {metadata.label.id} based on{' '}
                {selectedFeatures.join(', ')} with {metadata.summaryStat?.stat}%
                accuracy.
              </p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>About the Data</div>
              <p style={styles.details}>
                {metadata.datasetDetails?.description}
              </p>
              <br />
              {metadata.datasetDetails?.numRows && (
                <p style={styles.details}>
                  Dataset size: {metadata.datasetDetails?.numRows} rows
                </p>
              )}
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Intended Use</div>
              <p style={styles.details}>{metadata.potentialUses}</p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Warnings</div>
              <p style={styles.details}>{metadata.potentialMisuses}</p>
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Label</div>
              <FeatureDetails feature={metadata.label} />
            </div>
            <div style={styles.subPanel}>
              <div style={styles.heading}>Features</div>
              {metadata.features.map(feature => {
                return <FeatureDetails feature={feature} key={feature.id} />;
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  container: {
    color: color.black,
    textAlign: 'left',
    backgroundColor: color.lighter_gray,
    borderRadius: 5,
    padding: 20,
    whiteSpace: 'normal',
    lineHeight: 1.5,
    maxHeight: 'calc(80vh - 150px)',
    overflow: 'scroll'
  },
  subPanel: {
    backgroundColor: color.lightest_gray,
    borderRadius: 5,
    borderColor: color.gray,
    marginBottom: 10,
    padding: 10,
    overflowWrap: 'break-word'
  },
  bold: {
    fontFamily: "'Gotham 7r', sans-serif"
  },
  header: {
    fontFamily: "'Gotham 7r', sans-serif",
    marginTop: 0,
    lineHeight: '20px'
  },
  heading: {
    fontFamily: "'Gotham 7r', sans-serif",
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center'
  },
  details: {
    marginBottom: 0
  }
};
