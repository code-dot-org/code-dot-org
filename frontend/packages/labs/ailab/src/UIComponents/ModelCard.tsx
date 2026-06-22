/* React component to handle displaying the model card. */
import {imageUrl} from '../assetPath';
import {styles} from '../constants';
import {getPercentCorrect} from '../helpers/accuracy';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getDatasetDetails} from '../helpers/datasetDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {shallowEqual, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {getLabelToSave, getFeaturesToSave} from '../redux';

import Statement from './Statement';

const ModelCard = () => {
  const trainedModelDetails = useAppSelector(
    state => state.trainedModelDetails,
  );
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const percentCorrect = useAppSelector(getPercentCorrect);
  const label = useAppSelector(getLabelToSave);
  const features = useAppSelector(getFeaturesToSave);
  const datasetDetails = useAppSelector(getDatasetDetails, shallowEqual);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');
  const localizedLabel = getLocalizedColumnName(datasetDetails.name, label.id);
  const localizedFeatures = selectedFeatures.map(feature =>
    getLocalizedColumnName(datasetDetails.name, feature),
  );
  const predictionStatement = I18n.t('predictionStatement', {
    output: localizedLabel,
    inputs: localizedFeatures.join(', '),
  });
  return (
    <div style={styles.panel}>
      <Statement />
      <div style={styles.summaryScreenBot}>
        <img
          src={imageUrl('ai-bot/ai-bot-border.png')}
          className="ailab-image-hover"
          style={styles.summaryScreenBotImage}
          alt={I18n.t('aiBotAltText')}
        />
      </div>
      <div id="uitest-model-card" style={styles.modelCardContainer}>
        <h3 style={styles.modelCardHeader}>{trainedModelDetails.name}</h3>
        <div style={styles.modelCardSubpanel}>
          <h5 style={styles.modelCardHeading}>{I18n.t('modelCardAccuracy')}</h5>
          <div style={styles.modelCardContent}>
            <p style={styles.modelCardDetails}>
              <span>{percentCorrect}%</span>
            </p>
          </div>
        </div>
        <div style={styles.modelCardSubpanel}>
          <h5 style={styles.modelCardHeading}>
            {I18n.t('modelCardIntendedUse')}
          </h5>
          <div style={styles.modelCardContent}>
            {trainedModelDetails.potentialUses && (
              <p style={styles.modelCardDetails}>
                {trainedModelDetails.potentialUses}
              </p>
            )}
          </div>
        </div>
        <div style={styles.modelCardSubpanel}>
          <h5 style={styles.modelCardHeading}>
            {I18n.t('modelCardLimitations')}
          </h5>
          <div style={styles.modelCardContent}>
            {trainedModelDetails.potentialMisuses && (
              <p style={styles.modelCardDetails}>
                {trainedModelDetails.potentialMisuses}
              </p>
            )}
          </div>
        </div>
        <div style={styles.modelCardSubpanel}>
          <h5 style={styles.modelCardHeading}>
            {I18n.t('modelCardDatasetDetails')}
          </h5>
          <div style={styles.modelCardContent}>
            {datasetDetails.description && (
              <p style={styles.modelCardDetails}>
                {datasetDetails.description}
              </p>
            )}
            {datasetDetails.numRows && (
              <p style={styles.modelCardDetails}>
                {I18n.t('modelCardDatasetDetailsSize')}
                <br />
                {I18n.t('modelCardDatasetDetailsSizeCount', {
                  rowCount: datasetDetails.numRows,
                })}
              </p>
            )}
          </div>
        </div>
        <div style={styles.modelCardSubpanel}>
          <h5 style={styles.modelCardHeading}>
            {I18n.t('modelCardFeaturesAndLabel')}
          </h5>
          <div style={styles.modelCardContent}>
            <p style={styles.modelCardDetails}>{predictionStatement}</p>
          </div>
        </div>
        <div style={styles.modelCardSubpanel}>
          <h5 style={styles.modelCardHeading}>{I18n.t('modelCardLabel')}</h5>
          <div style={styles.modelCardContent}>
            <p style={styles.bold}>{localizedLabel}</p>
            {label.description && <p>{label.description}</p>}
            {!label.values && (
              <p style={styles.modelCardDetails}>
                {I18n.t('modelCardPossibleValues')}
                <br />
                {I18n.t('modelCardPossibleValuesMinimum')} {label.min}
                <br />
                {I18n.t('modelCardPossibleValuesMaximum')} {label.max}
              </p>
            )}
            {label.values && (
              <p style={styles.modelCardDetails}>
                {I18n.t('modelCardPossibleValues')}
                <br />
                {label.values
                  .map(value => getLocalizedValue(value, datasetId))
                  .join(' ')}
              </p>
            )}
          </div>
        </div>
        <div style={styles.modelCardSubpanel}>
          <h5 style={styles.modelCardHeading}>{I18n.t('modelCardFeatures')}</h5>
          <div style={styles.modelCardContent}>
            {features.length > 0 &&
              features.map((feature, index) => {
                return (
                  <div key={index}>
                    <p style={styles.bold}>{feature.id}</p>
                    {feature.description && <p>{feature.description}</p>}
                    {!feature.values && (
                      <p>
                        {I18n.t('modelCardPossibleValues')}
                        <br />
                        {I18n.t('modelCardPossibleValuesMinimum')} {feature.min}
                        <br />
                        {I18n.t('modelCardPossibleValuesMaximum')} {feature.max}
                      </p>
                    )}
                    {feature.values && (
                      <p>
                        {I18n.t('modelCardPossibleValues')}
                        <br />
                        {feature.values
                          .map(value => getLocalizedValue(value, datasetId))
                          .join(' ')}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
