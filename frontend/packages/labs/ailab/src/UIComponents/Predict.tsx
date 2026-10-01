/* React component to handle predicting and displaying predictions. */
import classNames from 'classnames';
import type React from 'react';

import {imageUrl} from '../assetPath';
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

import shared from '../shared.module.scss';
import styles from './predict.module.scss';

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
    <div id="predict" className={shared.panel}>
      <div className={shared.largeText}>{I18n.t('predictHeader')}</div>
      <ScrollableContent>
        <div>
          {selectedNumericalFeatures.map((feature, index) => {
            const min = extremaByColumn[feature].min.toFixed(2);
            const max = extremaByColumn[feature].max.toFixed(2);

            return (
              <div className={shared.cardRow} key={index}>
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
              <div className={shared.cardRow} key={index}>
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
          className={styles.button}
          onClick={onClickPredict}
          disabled={!predictAvailable}
        >
          {I18n.t('predictButton')}
        </button>
      </div>
      {predictedLabel !== undefined && (
        <div className={classNames(shared.contents, styles.botResult)}>
          <div className={styles.botColumn}>
            <img
              className={classNames(shared.hoverGrow, styles.bot)}
              src={imageUrl('ai-bot/ai-bot-border.png')}
              alt={I18n.t('aiBotAltText')}
            />
          </div>
          <div className={styles.prediction}>
            <div className={shared.largeText}>
              {I18n.t('predictAIBotPredicts')}
            </div>
            <div>{getLocalizedColumnName(datasetId, labelColumn)}</div>
            <div>{getLocalizedValue(predictedLabel, datasetId)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Predict;
