/* React component to handle predicting and displaying predictions. */
import type React from 'react';

import {imageUrl} from '../assetPath';
import {styles} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {getConvertedPredictedLabel} from '../helpers/valueConversion';
import {getLocalizedValue} from '../helpers/valueDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setTestData, getPredictAvailable} from '../redux';
import {
  getSelectedCategoricalFeatures,
  getSelectedNumericalFeatures,
  getUniqueOptionsByColumn,
  getExtremaByColumn,
} from '../selectors';
import {store} from '../store';
import train from '../train';

import ScrollableContent from './ScrollableContent';

const Predict = () => {
  const dispatch = useAppDispatch();
  const testData = useAppSelector(state => state.testData);
  const predictedLabel = useAppSelector(getConvertedPredictedLabel);
  const labelColumn = useAppSelector(state => state.labelColumn || 'unknown');
  const selectedNumericalFeatures = useAppSelector(
    getSelectedNumericalFeatures,
  );
  const selectedCategoricalFeatures = useAppSelector(
    getSelectedCategoricalFeatures,
  );
  const uniqueOptionsByColumn = useAppSelector(getUniqueOptionsByColumn);
  const predictAvailable = useAppSelector(getPredictAvailable);
  const extremaByColumn = useAppSelector(getExtremaByColumn);
  const datasetId = useAppSelector(state => state.metadata?.name || 'unknown');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    feature: string,
  ) => {
    dispatch(setTestData(feature, event.target.value));
  };

  const onClickPredict = () => {
    train.onClickPredict(store);
  };

  return (
    <div id="predict" style={{...styles.panel, ...styles.rightPanel}}>
      <div style={styles.largeText}>{I18n.t('predictHeader')}</div>
      <ScrollableContent>
        <div>
          {selectedNumericalFeatures.map((feature, index) => {
            const min = extremaByColumn[feature].min.toFixed(2);
            const max = extremaByColumn[feature].max.toFixed(2);

            return (
              <div style={styles.cardRow} key={index}>
                <label>
                  {getLocalizedColumnName(datasetId, feature)}
                  &nbsp;
                  <input
                    type="number"
                    onChange={event => handleChange(event, feature)}
                    value={testData[feature] || ''}
                    placeholder={I18n.t('predictPlaceholder', {
                      minimum: +min,
                      maximum: +max,
                    })}
                  />
                </label>
              </div>
            );
          })}
        </div>
        <div>
          {selectedCategoricalFeatures.map((feature, index) => {
            return (
              <div style={styles.cardRow} key={index}>
                <div>{getLocalizedColumnName(datasetId, feature)}&nbsp;</div>
                <div>
                  <select
                    onChange={event => handleChange(event, feature)}
                    value={testData[feature]}
                  >
                    <option>{''}</option>
                    {uniqueOptionsByColumn[feature]
                      .sort()
                      .map((option, index) => {
                        return (
                          <option key={index} value={option}>
                            {getLocalizedValue(option, datasetId)}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollableContent>
      <br />
      <div>
        <button
          type="button"
          style={!predictAvailable ? styles.disabledButton : undefined}
          onClick={onClickPredict}
          disabled={!predictAvailable}
        >
          {I18n.t('predictButton')}
        </button>
      </div>
      {predictedLabel && (
        <div style={styles.contentsPredictBot}>
          <div style={styles.predictBotLeft}>
            <img
              className="ailab-image-hover"
              style={styles.predictBot}
              src={imageUrl('ai-bot/ai-bot-border.png')}
              alt={I18n.t('aiBotAltText')}
            />
          </div>
          <div style={styles.predictBotRight}>
            <div style={styles.statement}>{I18n.t('predictAIBotPredicts')}</div>
            <div>{getLocalizedColumnName(datasetId, labelColumn)}</div>
            <div>{getLocalizedValue(predictedLabel, datasetId)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predict;
