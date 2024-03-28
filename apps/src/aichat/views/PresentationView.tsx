import React from 'react';

import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {MODEL_CARD_FIELDS_AND_LABELS} from '@cdo/apps/aichat/views/modelCustomization/constants';
import styles from '@cdo/apps/aichat/views/model-customization-workspace.module.scss';
// import CollapsibleSection from '@cdo/apps/lab2/levelEditors/aiCustomizations/CollapsibleSection';
import {Heading4, StrongText} from '@cdo/apps/componentLibrary/typography';
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
            <div key={property}>
              <label htmlFor={property}>
                <StrongText className={moduleStyles.modelCardAttributes}>
                  {label}
                </StrongText>
              </label>
            </div>
          );
        })}
        <div key={'examplePrompts'}>
          <label htmlFor={'examplePrompts'}>
            <StrongText className={moduleStyles.modelCardAttributes}>
              Example Prompts and Topics
            </StrongText>
          </label>
        </div>
        <div key={'technicalInfo'}>
          <label htmlFor={'technicalInfo'}>
            <StrongText className={moduleStyles.modelCardAttributes}>
              Technical Info
            </StrongText>
          </label>
        </div>
      </div>
    </div>
  );
};

export default PublishNotes;
