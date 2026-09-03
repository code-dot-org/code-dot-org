/* React component to handle exporting a trained model. */
import type React from 'react';
import {useState} from 'react';

import {ColumnTypes, styles, ModelNameMaxLength} from '../constants';
import {getLocalizedColumnName} from '../helpers/columnDetails';
import {
  getDatasetDescription,
  isUserUploadedDataset,
} from '../helpers/datasetDetails';
import {useAppDispatch, useAppSelector} from '../hooks';
import I18n from '../i18n';
import {setTrainedModelDetail} from '../redux';
import {getSelectedColumnsDescriptions} from '../selectors';

import ScrollableContent from './ScrollableContent';
import Statement from './Statement';

const ExportModel = () => {
  const dispatch = useAppDispatch();
  const labelColumn = useAppSelector(state => state.labelColumn);
  const selectedFeatures = useAppSelector(state => state.selectedFeatures);
  const columnsByDataType = useAppSelector(state => state.columnsByDataType);
  const trainedModelDetails = useAppSelector(
    state => state.trainedModelDetails,
  );
  const columnDescriptions = useAppSelector(getSelectedColumnsDescriptions);
  const dataDescription = useAppSelector(getDatasetDescription);
  const isUserUploaded = useAppSelector(isUserUploadedDataset);
  const datasetId = useAppSelector(
    state => state.metadata && state.metadata.name,
  );

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
    dispatch(setTrainedModelDetail(field, event.target.value, isColumn));
  };

  const getPredictionBlockFields = () => {
    return selectedFeatures.map(feature => {
      const sampleValue =
        columnsByDataType[feature] === ColumnTypes.NUMERICAL
          ? I18n.t('exportModelBlockNumberValue')
          : I18n.t('exportModelBlockTextValue');
      const featureKey = feature.replace(/\W/g, '') || feature;
      return {
        id: feature,
        key: featureKey,
        sampleValue,
      };
    });
  };

  const predictionBlockFields = getPredictionBlockFields();
  const predictionBlockFieldSummary =
    predictionBlockFields.length > 0
      ? predictionBlockFields
          .map(field => `${field.key}: ${field.sampleValue}`)
          .join(', ')
      : I18n.t('exportModelBlockNoFields');

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
      answer: trainedModelDetails.potentialUses ?? '',
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
      answer: trainedModelDetails.potentialMisuses ?? '',
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
    answer: isUserUploaded
      ? (trainedModelDetails.datasetDescription ?? '')
      : dataDescription,
  };

  const arrowIcon = showColumnDescriptions
    ? 'fa fa-caret-up'
    : 'fa fa-caret-down';

  const columnCount = getColumnFields().length;

  return (
    <div id="uitest-model-card-form" style={styles.panel}>
      <Statement />
      <ScrollableContent tinted={true}>
        <div style={styles.exportModelHeader}>
          <h2 style={styles.exportModelHeading}>
            {I18n.t('exportModelHeading')}
          </h2>
          <p style={styles.regularText}>{I18n.t('exportModelDescription')}</p>
        </div>
        <div style={styles.exportModelApiPreview}>
          <h3 style={styles.exportModelSectionHeading}>
            {I18n.t('exportModelApiPreviewHeading')}
          </h3>
          <p style={styles.regularText}>
            {I18n.t('exportModelApiPreviewDescription')}
          </p>
          <div
            style={styles.exportModelBlocklyPreview}
            role="img"
            aria-label={I18n.t('exportModelBlockAriaLabel', {
              fields: predictionBlockFieldSummary,
            })}
          >
            <div style={styles.exportModelBlocklyBlock}>
              <div style={styles.exportModelBlocklyHeader}>
                <span style={styles.exportModelBlocklyFunctionName}>
                  getPrediction
                </span>
                <span style={styles.exportModelBlocklyInputLabel}>
                  {I18n.t('exportModelBlockUsingLabel')}
                </span>
                <span style={styles.exportModelBlocklyValueSlot}>
                  {I18n.t('exportModelBlockDataLabel')}
                </span>
              </div>
              <div style={styles.exportModelBlocklyDataBlock}>
                <div style={styles.exportModelBlocklyDataHeader}>
                  {I18n.t('exportModelBlockDataLabel')}
                </div>
                {predictionBlockFields.length > 0 ? (
                  predictionBlockFields.map(field => (
                    <div
                      key={field.id}
                      style={styles.exportModelBlocklyFeatureRow}
                    >
                      <span style={styles.exportModelBlocklyFeatureName}>
                        {field.key}
                      </span>
                      <span style={styles.exportModelBlocklyValueInput}>
                        {field.sampleValue}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={styles.exportModelBlocklyNoFields}>
                    {I18n.t('exportModelBlockNoFields')}
                  </div>
                )}
              </div>
              <div style={styles.exportModelBlocklyReturnRow}>
                <span>{I18n.t('exportModelApiResultLabel')}</span>
                <span style={styles.exportModelBlocklyReturnValue}>
                  {I18n.t('exportModelApiResult')}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div key={nameField.id} style={styles.cardRow}>
          <label htmlFor="uitest-model-name-input">
            <span style={styles.bold}>{nameField.text}</span>
            &nbsp;
            <span style={styles.italic}>
              ({I18n.t('saveModelFieldRequired')})
            </span>
          </label>
          <div>
            <input
              id="uitest-model-name-input"
              onChange={event =>
                handleChange(event, nameField.id, nameField.isColumn)
              }
              maxLength={ModelNameMaxLength}
              value={trainedModelDetails.name ?? ''}
            />
          </div>
        </div>
        <div>
          {getUsesFields().map(field => {
            const inputId = `export-${field.id}-input`;
            return (
              <div key={field.id} style={styles.cardRow}>
                <label htmlFor={inputId} style={styles.bold}>
                  {field.text}
                </label>
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
                <div>
                  <textarea
                    id={inputId}
                    rows={4}
                    onChange={event =>
                      handleChange(event, field.id, !!field.isColumn)
                    }
                    placeholder={field.placeholder}
                    style={styles.saveInputsWidth}
                    value={field.answer}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div key={dataDescriptionField.id} style={styles.cardRow}>
          <label htmlFor="export-dataset-description" style={styles.bold}>
            {dataDescriptionField.text}
          </label>
          {isUserUploaded && (
            <div>
              <textarea
                id="export-dataset-description"
                rows={4}
                onChange={event =>
                  handleChange(event, dataDescriptionField.id, false)
                }
                placeholder={dataDescriptionField.placeholder}
                style={styles.saveInputsWidth}
                value={dataDescriptionField.answer}
              />
            </div>
          )}
          {!isUserUploaded && <div>{dataDescriptionField.answer}</div>}
        </div>
        <div>
          <button
            type="button"
            onClick={toggleColumnDescriptions}
            style={styles.saveModelToggleButton}
            aria-expanded={showColumnDescriptions}
            aria-controls="export-column-descriptions"
          >
            <i className={arrowIcon} />
            &nbsp;
            <span style={styles.bold}>
              {I18n.t('saveModelColumnCountLabel')}
            </span>
            &nbsp; ({columnCount})
          </button>
          {showColumnDescriptions && (
            <div
              id="export-column-descriptions"
              style={styles.saveModelToggleContents}
            >
              {getColumnFields().map((field, index) => {
                const inputId = `export-column-description-${index}`;
                return (
                  <div key={field.id} style={styles.cardRow}>
                    <label htmlFor={inputId}>
                      <span style={styles.bold}>{field.localizedName}</span> (
                      {field.columnType})
                    </label>
                    {isUserUploaded && (
                      <div>
                        <textarea
                          id={inputId}
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

export default ExportModel;
