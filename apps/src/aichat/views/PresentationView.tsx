import React from 'react';
import ModelCardViewRow from './ModelCardViewRow';
import {MODEL_CARD_FIELDS_AND_LABELS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';
import {Heading4} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './presentation-view.module.scss';

const PresentationView: React.FunctionComponent = () => {
  const modelCardIcons = [
    'memo',
    'bullseye-pointer',
    'diamond-exclamation',
    'vial-circle-check',
  ];

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <Heading4 className={moduleStyles.modelCardTitle}>
          Title of Model Card
        </Heading4>
        {MODEL_CARD_FIELDS_AND_LABELS.map(([property, label], index) => {
          return (
            <>
              <ModelCardViewRow
                keyName={property}
                title={label}
                titleIcon={modelCardIcons[index]}
                expandedContent={`Example TEXT ${label}`}
              />
            </>
          );
        })}
        <ModelCardViewRow
          keyName="examplePrompts"
          title="Example Prompts and Topics"
          titleIcon="message-lines"
          expandedContent="Example TEXT - Example Prompts and Topics"
        />
        <ModelCardViewRow
          keyName="technicalInfo"
          title="Technical Info"
          titleIcon="screwdriver-wrench"
          expandedContent="Example TEXT - Technical Info"
        />
      </div>
    </div>
  );
};

export default PresentationView;
