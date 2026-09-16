import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';

import localization from '@cdo/apps/localization';

import moduleStyles from './ModelCard.module.scss';

class FeatureDetails extends React.Component {
  static propTypes = {
    feature: PropTypes.object,
  };

  render() {
    const {feature} = this.props;

    return (
      <div className={moduleStyles.feature}>
        <Typography variant="body2" className={moduleStyles.featureId}>
          {feature.id}
        </Typography>
        <Typography variant="body2">{feature.description}</Typography>
        <Typography variant="body2">
          <span className={moduleStyles.bold}>Possible Values: </span>
          {feature.values
            ? feature.values
                .map(value => localization.translate(value))
                .join(', ')
            : `min: ${feature.min}, max: ${feature.max}`}
        </Typography>
      </div>
    );
  }
}

export default class ModelCard extends React.Component {
  static propTypes = {
    model: PropTypes.object,
  };

  render() {
    const model = this.props.model;
    const metadata = model?.metadata;
    if (!model || !metadata) {
      return <div />;
    }
    const selectedFeatures = metadata.features.map(feature => feature.id);

    return (
      <div className={moduleStyles.container}>
        <Typography variant="h5" className={moduleStyles.header}>
          {metadata.name}
        </Typography>
        <Typography variant="body2">
          <span className={moduleStyles.bold}>Id: </span>
          {this.props.model.id}
        </Typography>
        <div className={moduleStyles.subPanel}>
          <Typography variant="label1" className={moduleStyles.heading}>
            Accuracy
          </Typography>
          <Typography variant="body2">{metadata.summaryStat?.stat}%</Typography>
        </div>
        <div className={moduleStyles.subPanel}>
          <Typography variant="label1" className={moduleStyles.heading}>
            Intended Use
          </Typography>
          <Typography variant="body2">{metadata.potentialUses}</Typography>
        </div>
        <div className={moduleStyles.subPanel}>
          <Typography variant="label1" className={moduleStyles.heading}>
            Warnings and Limitations
          </Typography>
          <Typography variant="body2">{metadata.potentialMisuses}</Typography>
        </div>
        <div className={moduleStyles.subPanel}>
          <Typography variant="label1" className={moduleStyles.heading}>
            About the Data
          </Typography>
          <Typography variant="body2">
            {metadata.datasetDetails?.description}
          </Typography>
          {metadata.datasetDetails?.numRows && (
            <Typography variant="body2" className={moduleStyles.spacer}>
              Dataset size: {metadata.datasetDetails?.numRows} rows
            </Typography>
          )}
        </div>
        <div className={moduleStyles.subPanel}>
          <Typography variant="label1" className={moduleStyles.heading}>
            Features and Label
          </Typography>
          <Typography variant="body2">
            Predict {metadata.label.id} based on {selectedFeatures.join(', ')}.
          </Typography>
        </div>
        <div className={moduleStyles.subPanel}>
          <Typography variant="label1" className={moduleStyles.heading}>
            Label
          </Typography>
          <FeatureDetails feature={metadata.label} />
        </div>
        <div className={moduleStyles.subPanel}>
          <Typography variant="label1" className={moduleStyles.heading}>
            Features
          </Typography>
          {metadata.features.map(feature => (
            <FeatureDetails feature={feature} key={feature.id} />
          ))}
        </div>
      </div>
    );
  }
}
