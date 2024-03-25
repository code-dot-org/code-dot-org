import React from 'react';

import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Lab2Registry from '../../../lab2/Lab2Registry';
import {
  EMPTY_AI_CUSTOMIZATIONS,
  MODEL_CARD_FIELDS_AND_LABELS,
} from './constants';
import {isVisible, isDisabled} from './utils';
import {
  setModelCardProperty,
  addChatMessage,
} from '@cdo/apps/aichat/redux/aichatRedux';
import styles from '../model-customization-workspace.module.scss';
import {AichatLevelProperties, Role, Status} from '@cdo/apps/aichat/types';

const PublishNotes: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const {visibility} = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
  ).modelCardInfo;
  const {modelCardInfo} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const save = () => {
    Lab2Registry.getInstance()
      .getProjectManager()
      ?.save({source: JSON.stringify(aiCustomizations)}, true);
  };

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {MODEL_CARD_FIELDS_AND_LABELS.map(([id, text]) => {
          return (
            isVisible(visibility) && (
              <div className={styles.inputContainer} key={id}>
                <label htmlFor={id}>
                  <StrongText>{text}</StrongText>
                </label>
                <textarea
                  id={id}
                  disabled={isDisabled(visibility)}
                  value={modelCardInfo[id]}
                  onChange={event =>
                    dispatch(
                      setModelCardProperty({
                        property: id,
                        value: event.target.value,
                      })
                    )
                  }
                />
              </div>
            )
          );
        })}
      </div>
      <div className={styles.footerButtonContainer}>
        <button type="button" disabled={false} onClick={save}>
          Publish
        </button>
      </div>
    </div>
  );
};

export default PublishNotes;
