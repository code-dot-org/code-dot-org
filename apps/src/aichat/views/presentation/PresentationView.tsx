import React from 'react';
import ModelCardRow from './ModelCardRow';
import {MODEL_CARD_FIELDS_AND_LABELS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';
import {Heading4} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './presentation-view.module.scss';

const PresentationView: React.FunctionComponent = () => {
  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <Heading4 className={moduleStyles.modelCardTitle}>
          Title of Model Card
        </Heading4>
        {MODEL_CARD_FIELDS_AND_LABELS.map(
          ([property, label, iconName], index) => {
            return (
              <ModelCardRow
                keyName={property}
                title={label}
                titleIcon={iconName}
                expandedContent={`Example TEXT ${label}`}
              />
            );
          }
        )}
        <ModelCardRow
          keyName="examplePrompts"
          title="Example Prompts and Topics"
          titleIcon="message-lines"
          expandedContent="Example TEXT - Example Prompts and Topics Every paragraph you write should include clear opening, supporting, and closing sentences. The opening sentence introduces the topic of the paragraph or signals a change of direction."
        />
        <ModelCardRow
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
