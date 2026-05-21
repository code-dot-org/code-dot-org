/* React component to handle saving a trained model. */
import React, {useState} from 'react';
import {connect} from 'react-redux';
import {setTrainedModelDetail, RootState} from '../redux';
import {Dispatch} from 'redux';
import {
  getDatasetDescription,
  isUserUploadedDataset,
} from '../helpers/datasetDetails';
import {getSelectedColumnsDescriptions} from '../selectors';
import {styles, ModelNameMaxLength} from '../constants';
import Statement from './Statement';
import ScrollableContent from './ScrollableContent';
import I18n from '../i18n';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {TrainedModelDetailsSave} from '../types';
import KNN from 'ml-knn';

interface SaveModelProps {
  trainedModel: KNN | undefined;
  setTrainedModelDetail: (
    field: string,
    value: string,
    isColumn: boolean,
  ) => void;
  trainedModelDetails: TrainedModelDetailsSave;
  labelColumn: string | undefined;
  columnDescriptions: {id: string; description: string | null}[];
  dataDescription: string | undefined;
  isUserUploadedDataset: boolean;
  datasetId: string | undefined;
}

const SaveModel = ({
  trainedModel,
  setTrainedModelDetail,
  trainedModelDetails,
  labelColumn,
  columnDescriptions,
  dataDescription,
  isUserUploadedDataset: isUserUploaded,
  datasetId,
}: SaveModelProps) => {
  const [showColumnDescriptions, setShowColumnDescriptions] =
    useState(isUserUploaded);

  const toggleColumnDescriptions = () => {
    setShowColumnDescriptions(!showColumnDescriptions);
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
    isColumn: boolean,
  ) => {
    setTrainedModelDetail(field, event.target.value, isColumn);
  };

  const getColumnFields = () => {
    const fields: {
      id: string;
      isColumn: boolean;
      columnType: string | undefined;
      answer: string | null;
      localizedName: string;
      placeholder?: string;
    }[] = [];

    for (const columnDescription of columnDescriptions) {
      const labelType = I18n.t('saveModelColumnTypeLabel');
      const featureType = I18n.t('saveModelColumnTypeFeature');
      const columnType =
        columnDescription.id === labelColumn ? labelType : featureType;
      fields.push({
        id: columnDescription.id,
        isColumn: true,
        columnType,
        answer: columnDescription.description,
        localizedName: getLocalizedColumnName(datasetId!, columnDescription.id),
      });
    }
    return fields;
  };

  const getUsesFields = () => {
    const fields: {
      id: string;
      text: string | undefined;
      description: string | undefined;
      descriptionDetails?: (string | undefined)[];
      placeholder: string | undefined;
      isColumn?: boolean;
      answer?: string;
    }[] = [];
    fields.push({
      id: 'potentialUses',
      text: I18n.t('potentialUsesLabel'),
      description: I18n.t('potentialUsesDescription'),
      placeholder: I18n.t('potentialUsesPlaceholder'),
    });
    fields.push({
      id: 'potentialMisuses',
      text: I18n.t('potentialMisusesLabel'),
      description: I18n.t('potentialMisusesDescription'),
      descriptionDetails: [
        I18n.t('potentialMisusesDescriptionRepresent'),
        I18n.t('potentialMisusesDescriptionEnough'),
        I18n.t('potentialMisusesDescriptionSituations'),
      ],
      placeholder: I18n.t('potentialMisusesPlaceholder'),
    });

    return fields;
  };

  const nameField = {
    id: 'name',
    text: I18n.t('modelNameLabel'),
    isColumn: false,
  };

  const dataDescriptionField = {
    id: 'datasetDescription',
    text: I18n.t('datasetDescriptionLabel'),
    placeholder: I18n.t('datasetDescriptionPlaceholder'),
    answer: dataDescription,
  };

  const arrowIcon = showColumnDescriptions
    ? 'fa fa-caret-up'
    : 'fa fa-caret-down';

  const columnCount = getColumnFields().length;

  return (
    <div id="uitest-model-card-form" style={styles.panel}>
      <Statement />
      <ScrollableContent tinted={true}>
        <div key={nameField.id} style={styles.cardRow}>
          <span style={styles.bold}>{nameField.text}</span>
          &nbsp;
          <span style={styles.italic}>
            ({I18n.t('saveModelFieldRequired')})
          </span>
          <div>
            <input
              id="uitest-model-name-input"
              onChange={event =>
                handleChange(event, nameField.id, nameField.isColumn)
              }
              maxLength={ModelNameMaxLength}
            />
          </div>
        </div>
        <div>
          {getUsesFields().map(field => {
            return (
              <div key={field.id} style={styles.cardRow}>
                <div style={styles.bold}>{field.text}</div>
                <div>{field.description}</div>
                <ul>
                  {field.descriptionDetails &&
                    field.descriptionDetails.map(
                      (detail: string | undefined, index: number) => {
                        return (
                          <li style={styles.regularText} key={index}>
                            {detail}
                          </li>
                        );
                      },
                    )}
                </ul>
                {!field.answer && (
                  <div>
                    <textarea
                      rows={4}
                      onChange={event =>
                        handleChange(event, field.id, !!field.isColumn)
                      }
                      placeholder={field.placeholder}
                      style={styles.saveInputsWidth}
                    />
                  </div>
                )}
                {field.answer && <div>{field.answer}</div>}
              </div>
            );
          })}
        </div>
        <div key={dataDescriptionField.id} style={styles.cardRow}>
          <div style={styles.bold}>{dataDescriptionField.text}</div>
          {isUserUploaded && (
            <div>
              <textarea
                rows={4}
                onChange={event =>
                  handleChange(event, dataDescriptionField.id, false)
                }
                placeholder={dataDescriptionField.placeholder}
                style={styles.saveInputsWidth}
              />
            </div>
          )}
          {!isUserUploaded && <div>{dataDescriptionField.answer}</div>}
        </div>
        <div>
          <span
            onClick={toggleColumnDescriptions}
            onKeyDown={toggleColumnDescriptions}
            style={styles.saveModelToggle}
            role="button"
            tabIndex={0}
          >
            <i className={arrowIcon} />
            &nbsp;
            <span style={styles.bold}>
              {I18n.t('saveModelColumnCountLabel')}
            </span>
            &nbsp; ({columnCount})
          </span>
          {showColumnDescriptions && (
            <div style={styles.saveModelToggleContents}>
              {getColumnFields().map(field => {
                return (
                  <div key={field.id} style={styles.cardRow}>
                    <div>
                      <span style={styles.bold}>{field.localizedName}</span> (
                      {field.columnType})
                    </div>
                    {isUserUploaded && (
                      <div>
                        <textarea
                          rows={1}
                          onChange={event =>
                            handleChange(event, field.id, !!field.isColumn)
                          }
                          placeholder={field.placeholder}
                          value={field.answer || ''}
                          style={styles.saveInputsWidth}
                        />
                      </div>
                    )}
                    {!isUserUploaded && <div>{field.answer}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollableContent>
    </div>
  );
};

export default connect(
  (state: RootState) => ({
    trainedModel: state.trainedModel,
    trainedModelDetails: state.trainedModelDetails,
    labelColumn: state.labelColumn,
    columnDescriptions: getSelectedColumnsDescriptions(state),
    dataDescription: getDatasetDescription(state),
    isUserUploadedDataset: isUserUploadedDataset(state),
    datasetId: state.metadata && state.metadata.name,
  }),
  (dispatch: Dispatch) => ({
    setTrainedModelDetail(field: string, value: string, isColumn: boolean) {
      dispatch(setTrainedModelDetail(field, value, isColumn));
    },
  }),
)(SaveModel);
