import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useMemo} from 'react';

import {
  getModelCardFieldsLabelsIcons,
  getTechnicalInfoFields,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {modelDescriptions} from '../../constants';
import aichatI18n from '../../locale';

import ModelCardRow from './ModelCardRow';

import moduleStyles from './presentation-view.module.scss';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';

const PresentationView: React.FunctionComponent = () => {
  const savedAiCustomizations = useAppSelector(
    state => state.aichat.savedAiCustomizations
  );
  const {selectedModelId, systemPrompt, temperature, retrievalContexts} =
    savedAiCustomizations;
  const modelCardInfo = savedAiCustomizations.modelCardInfo;
  const {
    name: modelName = '',
    trainingData = '',
    overview = '',
  } = modelDescriptions.find(model => model.id === selectedModelId) ?? {};

  const technicalInfo = useMemo(() => {
    const technicalInfoFields = getTechnicalInfoFields();
    const technicalInfoData: Record<string, string | number | boolean> = {
      [technicalInfoFields[0]]: modelName,
      [technicalInfoFields[1]]: overview,
      [technicalInfoFields[2]]: trainingData,
      [technicalInfoFields[3]]: systemPrompt,
      [technicalInfoFields[4]]: temperature,
      [technicalInfoFields[5]]: retrievalContexts.length > 0,
    };
    const technicalInfo = technicalInfoFields.map(field => {
      if (typeof technicalInfoData[field] === 'boolean') {
        return `${field}: ${technicalInfoData[field] ? 'Yes' : 'No'}`;
      }
      return `${field}: ${technicalInfoData[field]}`;
    });
    return technicalInfo;
  }, [
    retrievalContexts,
    systemPrompt,
    temperature,
    modelName,
    overview,
    trainingData,
  ]);

  return (
    <div
      className={classNames(
        styles.verticalFlexContainer,
        moduleStyles.container
      )}
    >
      <Typography
        id="uitest-presentation-view-header"
        className={moduleStyles.modelCardTitle}
        variant="h4"
        gutterBottom
      >
        {modelCardInfo['botName']}
      </Typography>
      <div className={moduleStyles.modelCardFields}>
        {getModelCardFieldsLabelsIcons().map(
          ({property, label, icon, displayTooltip}) => {
            if (property === 'botName' || property === 'isPublished') {
              return null;
            }
            return (
              <ModelCardRow
                title={label}
                titleIcon={icon}
                expandedContent={modelCardInfo[property]}
                key={property}
                tooltipText={displayTooltip}
              />
            );
          }
        )}
        <ModelCardRow
          title={aichatI18n.technicalInfoHeader()}
          titleIcon="screwdriver-wrench"
          expandedContent={technicalInfo}
          key="technicalInfo"
          tooltipText={aichatI18n.technicalInfoHeader_tooltipText()}
        />
      </div>
    </div>
  );
};

export default PresentationView;
