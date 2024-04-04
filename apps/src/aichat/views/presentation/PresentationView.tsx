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

const PresentationView: React.FunctionComponent = () => {
  const currentAiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  const {systemPrompt, temperature, retrievalContexts} =
    currentAiCustomizations;
  const modelCardInfo = currentAiCustomizations.modelCardInfo;

  // These are temporary constants. They will be retrieved from s3.
  const EXAMPLE_MODEL_NAME = 'Model A';
  const EXAMPLE_MODEL_TRAINING_DATA = 'Model A Training Data';

  const technicalInfo = useMemo(() => {
    const TECHNICAL_INFO_VALUES: (string | number | boolean)[] = [
      EXAMPLE_MODEL_NAME,
      EXAMPLE_MODEL_TRAINING_DATA,
      systemPrompt,
      temperature,
      retrievalContexts.length > 0,
    ];
    const technicalInfo = TECHNICAL_INFO_FIELDS.map((field, index) => {
      if (typeof TECHNICAL_INFO_VALUES[index] === 'boolean') {
        return `${field}: ${TECHNICAL_INFO_VALUES[index] ? 'Yes' : 'No'}`;
      }
      return `${field}: ${TECHNICAL_INFO_VALUES[index]}`;
    });
    return technicalInfo;
  }, [retrievalContexts, systemPrompt, temperature]);

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <Heading4 className={moduleStyles.modelCardTitle}>
          Title of Model Card
        </Heading4>
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
