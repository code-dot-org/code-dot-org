import React, {useMemo} from 'react';

import {
  MODEL_CARD_FIELDS_LABELS_ICONS,
  TECHNICAL_INFO_FIELDS,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import {Heading4} from '@cdo/apps/componentLibrary/typography';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import ModelCardRow from './ModelCardRow';

import moduleStyles from './presentation-view.module.scss';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';

const PresentationView: React.FunctionComponent = () => {
  const currentAiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  const {botName, systemPrompt, temperature, retrievalContexts} =
    currentAiCustomizations;
  const modelCardInfo = currentAiCustomizations.modelCardInfo;

  // These are temporary constants. They will be retrieved from s3.
  const EXAMPLE_MODEL_NAME = 'Model A';
  const EXAMPLE_MODEL_TRAINING_DATA = 'Model A Training Data';

  const technicalInfo = useMemo(() => {
    const technicalInfoData: {
      [key in (typeof TECHNICAL_INFO_FIELDS)[number]]:
        | string
        | number
        | boolean;
    } = {
      'Model Name': EXAMPLE_MODEL_NAME,
      'Training Data': EXAMPLE_MODEL_TRAINING_DATA,
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
  }, [retrievalContexts, systemPrompt, temperature]);

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <Heading4 className={moduleStyles.modelCardTitle}>{botName}</Heading4>
        {MODEL_CARD_FIELDS_LABELS_ICONS.map(([property, label, iconName]) => {
          return (
            <ModelCardRow
              keyName={property}
              title={label}
              titleIcon={iconName}
              expandedContent={modelCardInfo[property]}
            />
          );
        })}
        <ModelCardRow
          keyName="technicalInfo"
          title="Technical Info"
          titleIcon="screwdriver-wrench"
          expandedContent={technicalInfo}
        />
      </div>
    </div>
  );
};

export default PresentationView;
