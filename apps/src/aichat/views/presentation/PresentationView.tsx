import React from 'react';
import ModelCardRow from './ModelCardRow';
import {MODEL_CARD_FIELDS_AND_LABELS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';
import {Heading4} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './presentation-view.module.scss';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

const PresentationView: React.FunctionComponent = () => {
  const currentAiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  const modelCardInfo = {...currentAiCustomizations.modelCardInfo};
  // const exampleTopicsArray = modelCardInfo.exampleTopics;
  const exampleTopicsArray = [
    'Example Topic 1',
    'Example Topic 2',
    'Example Topic 3',
  ];
  modelCardInfo.exampleTopics = exampleTopicsArray;
  console.log(
    'exampleTopicsArray outside of function',
    modelCardInfo.exampleTopics
  );

  const modelCardIcons = [
    'memo',
    'bullseye-pointer',
    'diamond-exclamation',
    'vial-circle-check',
  ];

  return (
    <div className={styles.verticalFlexContainer}>
      <Heading4 className={moduleStyles.modelCardTitle}>
        Title of Model Card
      </Heading4>
      {MODEL_CARD_FIELDS_AND_LABELS.map(([property, label], index) => {
        return (
          <ModelCardRow
            keyName={property}
            title={label}
            titleIcon={modelCardIcons[index]}
            expandedContent={modelCardInfo[property]}
          />
        );
      })}
      <ModelCardRow
        keyName="technicalInfo"
        title="Technical Info"
        titleIcon="screwdriver-wrench"
        expandedContent="Example TEXT - Technical Info"
      />
    </div>
  );
};

export default PresentationView;
