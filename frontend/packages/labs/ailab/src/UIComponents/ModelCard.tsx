/* React component to handle displaying the model card. */
import classNames from 'classnames';

import {imageUrl} from '../assetPath';
import {getPercentCorrect} from '../helpers/accuracy';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getDatasetDetails} from '../helpers/datasetDetails';
import {getLocalizedValue} from '../helpers/valueDetails';
import {deepEqual, shallowEqual, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {useProject} from '../ProjectContext';
import {getLabelToSave, getFeaturesToSave} from '../selectors/saveSelectors';
import type {ModelCardColumn} from '../types';

import Statement from './Statement';

import shared from '../shared.module.scss';
import styles from './modelCard.module.scss';

const ModelCard = () => {
  const trainedModelDetails = useAppSelector(
    state => state.trainedModelDetails,
  );
  const {project} = useProject();
  const selectedFeatures = project.selectedFeatures;
  const percentCorrect = useAppSelector(state =>
    getPercentCorrect(state, project),
  );
  const label = useAppSelector<ModelCardColumn>(
    state => getLabelToSave(state, project),
    deepEqual,
  );
  const features = useAppSelector<ModelCardColumn[]>(
    state => getFeaturesToSave(state, project),
    deepEqual,
  );
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
    <div className={shared.panel}>
      <Statement />
      <div className={styles.bot}>
        <img
          src={imageUrl('ai-bot/ai-bot-border.png')}
          className={classNames(shared.hoverGrow, styles.botImage)}
          alt={I18n.t('aiBotAltText')}
        />
      </div>
      <div id="uitest-model-card" className={styles.card}>
        <h3 className={styles.name}>{trainedModelDetails.name}</h3>
        <div className={styles.section}>
          <h5 className={styles.heading}>{I18n.t('modelCardAccuracy')}</h5>
          <div className={styles.content}>
            <p className={styles.details}>
              <span>{percentCorrect}%</span>
            </p>
          </div>
        </div>
        <div className={styles.section}>
          <h5 className={styles.heading}>{I18n.t('modelCardIntendedUse')}</h5>
          <div className={styles.content}>
            {trainedModelDetails.potentialUses && (
              <p className={styles.details}>
                {trainedModelDetails.potentialUses}
              </p>
            )}
          </div>
        </div>
        <div className={styles.section}>
          <h5 className={styles.heading}>{I18n.t('modelCardLimitations')}</h5>
          <div className={styles.content}>
            {trainedModelDetails.potentialMisuses && (
              <p className={styles.details}>
                {trainedModelDetails.potentialMisuses}
              </p>
            )}
          </div>
        </div>
        <div className={styles.section}>
          <h5 className={styles.heading}>
            {I18n.t('modelCardDatasetDetails')}
          </h5>
          <div className={styles.content}>
            {datasetDetails.description && (
              <p className={styles.details}>{datasetDetails.description}</p>
            )}
            {datasetDetails.numRows && (
              <p className={styles.details}>
                {I18n.t('modelCardDatasetDetailsSize')}
                <br />
                {I18n.t('modelCardDatasetDetailsSizeCount', {
                  rowCount: datasetDetails.numRows,
                })}
              </p>
            )}
          </div>
        </div>
        <div className={styles.section}>
          <h5 className={styles.heading}>
            {I18n.t('modelCardFeaturesAndLabel')}
          </h5>
          <div className={styles.content}>
            <p className={styles.details}>{predictionStatement}</p>
          </div>
        </div>
        <div className={styles.section}>
          <h5 className={styles.heading}>{I18n.t('modelCardLabel')}</h5>
          <div className={styles.content}>
            <p className={shared.bold}>{localizedLabel}</p>
            {label.description && <p>{label.description}</p>}
            {!label.values && (
              <p className={styles.details}>
                {I18n.t('modelCardPossibleValues')}
                <br />
                {I18n.t('modelCardPossibleValuesMinimum')} {label.min}
                <br />
                {I18n.t('modelCardPossibleValuesMaximum')} {label.max}
              </p>
            )}
            {label.values && (
              <p className={styles.details}>
                {I18n.t('modelCardPossibleValues')}
                <br />
                {label.values
                  .map(value => getLocalizedValue(value, datasetId))
                  .join(' ')}
              </p>
            )}
          </div>
        </div>
        <div className={styles.section}>
          <h5 className={styles.heading}>{I18n.t('modelCardFeatures')}</h5>
          <div className={styles.content}>
            {features.length > 0 &&
              features.map((feature, index) => {
                return (
                  <div key={index}>
                    <p className={shared.bold}>{feature.id}</p>
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
