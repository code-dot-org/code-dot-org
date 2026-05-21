/* React component to handle predicting and displaying predictions. */
import React from 'react';
import {connect} from 'react-redux';
import {store} from '../index';
import train from '../train';
import {setTestData, getPredictAvailable, RootState} from '../redux';
import {Dispatch} from 'redux';
import {getConvertedPredictedLabel} from '../helpers/valueConversion';
import {
  getSelectedCategoricalFeatures,
  getSelectedNumericalFeatures,
  getUniqueOptionsByColumn,
  getExtremaByColumn,
} from '../selectors';
import {styles} from '../constants';
import aiBotBorder from '@public/images/ai-bot/ai-bot-border.png';
import ScrollableContent from './ScrollableContent';
import I18n from '../i18n';
import {getLocalizedColumnName} from '../helpers/columnDetails';

interface PredictProps {
  labelColumn: string | undefined;
  selectedCategoricalFeatures: string[];
  selectedNumericalFeatures: string[];
  uniqueOptionsByColumn: Record<string, string[]>;
  testData: Record<string, string | number>;
  setTestData: (feature: string, value: string | number) => void;
  predictedLabel: string | number;
  getPredictAvailable: boolean;
  extremaByColumn: Record<string, {min: number; max: number}>;
  datasetId: string | undefined;
}

const Predict = ({
  labelColumn,
  selectedCategoricalFeatures,
  selectedNumericalFeatures,
  uniqueOptionsByColumn,
  testData,
  setTestData,
  predictedLabel,
  getPredictAvailable: predictAvailable,
  extremaByColumn,
  datasetId,
}: PredictProps) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    feature: string,
  ) => {
    setTestData(feature, event.target.value);
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
                  {getLocalizedColumnName(datasetId!, feature)}
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
                <div>{getLocalizedColumnName(datasetId!, feature)}&nbsp;</div>
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
                            {option}
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
              src={aiBotBorder}
              alt={I18n.t('aiBotAltText')}
            />
          </div>
          <div style={styles.predictBotRight}>
            <div style={styles.statement}>{I18n.t('predictAIBotPredicts')}</div>
            <div>{getLocalizedColumnName(datasetId!, labelColumn!)}</div>
            <div>
              {getLocalizedColumnName(datasetId!, String(predictedLabel))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default connect(
  (state: RootState) => ({
    testData: state.testData,
    predictedLabel: getConvertedPredictedLabel(state),
    labelColumn: state.labelColumn,
    selectedNumericalFeatures: getSelectedNumericalFeatures(state),
    selectedCategoricalFeatures: getSelectedCategoricalFeatures(state),
    uniqueOptionsByColumn: getUniqueOptionsByColumn(state),
    getPredictAvailable: getPredictAvailable(state),
    extremaByColumn: getExtremaByColumn(state),
    datasetId: state.metadata && state.metadata.name,
  }),
  (dispatch: Dispatch) => ({
    setTestData(feature: string, value: string | number) {
      dispatch(setTestData(feature, value));
    },
  }),
)(Predict);
