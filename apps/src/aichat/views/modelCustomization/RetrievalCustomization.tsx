import React, {useState, useCallback} from 'react';
import {useSelector} from 'react-redux';

import {LabState} from '@cdo/apps/lab2/lab2Redux';
import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import {AichatLevelProperties} from '../../types';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';
import styles from './retrieval-customization.module.scss';
import {EMPTY_AI_CUSTOMIZATIONS} from './constants';
import {isDisabled} from './utils';

const RetrievalCustomization: React.FunctionComponent = () => {
  const {retrievalContexts} = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
  );

  // We shouldn't actually do this once (ie, initialize state from redux) once students can update these,
  // but leaving as-is temporarily until we are set up to allow a user to update these initial values
  // and store them in redux.
  const [messages, setMessages] = useState<string[]>(retrievalContexts.value);
  const [newMessage, setNewMessage] = useState('');

  const onAdd = useCallback(() => {
    setMessages([...messages, newMessage]);
    setNewMessage('');
    document.getElementById('retrieval-input')?.focus();
  }, [messages, setMessages, newMessage, setNewMessage]);

  const onRemove = useCallback(
    (index: number) => {
      const messagesCopy = [...messages];
      messagesCopy.splice(index, 1);
      setMessages(messagesCopy);
    },
    [messages, setMessages]
  );

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div>
        <div className={modelCustomizationStyles.inputContainer}>
          <label htmlFor="system-prompt">
            <StrongText>Retrieval</StrongText>
          </label>
          <textarea
            id="retrieval-input"
            onChange={event => setNewMessage(event.target.value)}
            value={newMessage}
            disabled={isDisabled(retrievalContexts.visibility)}
          />
        </div>
        <div className={styles.addItemContainer}>
          <button
            type="button"
            onClick={onAdd}
            disabled={!newMessage || isDisabled(retrievalContexts.visibility)}
          >
            Add
          </button>
        </div>
        {messages.map((message, index) => {
          return (
            <div key={index} className={styles.itemContainer}>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={styles.removeItemButton}
                disabled={isDisabled(retrievalContexts.visibility)}
              >
                <FontAwesomeV6Icon
                  iconName="circle-xmark"
                  className={styles.removeItemIcon}
                />
              </button>
              <span className={styles.itemText}>{message}</span>
            </div>
          );
        })}
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <button
          type="button"
          disabled={isDisabled(retrievalContexts.visibility)}
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default RetrievalCustomization;
