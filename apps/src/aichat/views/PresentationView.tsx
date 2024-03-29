import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {MODEL_CARD_FIELDS_AND_LABELS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';
import CollapsibleSection from '@cdo/apps/lab2/levelEditors/aiCustomizations/CollapsibleSection';
import {BodyFourText, Heading4} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './presentation-view.module.scss';

const PublishNotes: React.FunctionComponent = () => {
  const {modelCardInfo} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  console.log('modelCardInfo', modelCardInfo);

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <Heading4 className={moduleStyles.modelCardTitle}>
          Title of Model Card
        </Heading4>
        {MODEL_CARD_FIELDS_AND_LABELS.map(([property, label]) => {
          return (
            <>
              <div key={property} className={moduleStyles.modelCardAttributes}>
                <CollapsibleSection
                  title={label}
                  titleSemanticTag="h6"
                  titleVisualAppearance="heading-xs"
                  collapsedIcon="caret-right"
                  expandedIcon="caret-down"
                >
                  <BodyFourText>Model card field example text</BodyFourText>
                </CollapsibleSection>
              </div>
              <hr className={moduleStyles.borderLine} />
            </>
          );
        })}
        <div
          key={'examplePrompts'}
          className={moduleStyles.modelCardAttributes}
        >
          <CollapsibleSection
            title="Example Prompts and Topics"
            titleSemanticTag="h6"
            titleVisualAppearance="heading-xs"
            collapsedIcon="caret-right"
            expandedIcon="caret-down"
          >
            <BodyFourText>
              <i>Example TEXT - Example Prompts and Topics</i>
            </BodyFourText>
          </CollapsibleSection>
        </div>
        <hr className={moduleStyles.borderLine} />
        <div key={'technicalInfo'} className={moduleStyles.modelCardAttributes}>
          <CollapsibleSection
            title="Technical Info"
            titleSemanticTag="h6"
            titleVisualAppearance="heading-xs"
            collapsedIcon="caret-right"
            expandedIcon="caret-down"
          >
            <BodyFourText>
              <i>Example TEXT - Technical Info</i>
            </BodyFourText>
          </CollapsibleSection>
        </div>
        <hr className={moduleStyles.borderLine} />
      </div>
    </div>
  );
};

export default PublishNotes;
