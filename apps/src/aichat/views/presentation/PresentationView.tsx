import React, {useMemo} from 'react';
import ModelCardRow from './ModelCardRow';
import {
  MODEL_CARD_FIELDS_LABELS_ICONS,
  TECHNICAL_INFO_FIELDS,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';
import {Heading4} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './presentation-view.module.scss';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {modelDescriptions} from '../../constants';

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
    const technicalInfoData: {
      [key in (typeof TECHNICAL_INFO_FIELDS)[number]]:
        | string
        | number
        | boolean;
    } = {
      'Model Name': modelName,
      Overview: overview,
      'Training Data': trainingData,
      'System Prompt': systemPrompt,
      Temperature: temperature,
      'Retrieval Used': retrievalContexts.length > 0,
    };
    const technicalInfo = TECHNICAL_INFO_FIELDS.map(field => {
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
    <div className={styles.verticalFlexContainer}>
      <div>
        <Heading4 className={moduleStyles.modelCardTitle}>
          {modelCardInfo['botName']}
        </Heading4>
        {MODEL_CARD_FIELDS_LABELS_ICONS.map(([property, label, iconName]) => {
          if (property === 'botName' || property === 'isPublished') {
            return null;
          }
          return (
            <ModelCardRow
              title={label}
              titleIcon={iconName}
              expandedContent={modelCardInfo[property]}
              key={property}
            />
          );
        })}
        <ModelCardRow
          title="Technical Info"
          titleIcon="screwdriver-wrench"
          expandedContent={technicalInfo}
          key="technicalInfo"
        />
      </div>
    </div>
  );
};

export default PresentationView;
