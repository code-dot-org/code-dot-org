import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';
import styles from './retrieval-customization.module.scss';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';

const DEFAULT_RETRIEVAL_CONTEXTS = {
  value: ['retrieval 1', 'retrieval 2'],
  visibility: 'editable',
};

// what does it mean for retrieval to be hidden? hide whole tab?
const RetrievalCustomization: React.FunctionComponent = () => {
  // deal with AiCustomizations vs LevelAiCustomizations distinction in requiring model
  const retrievalContexts = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations?.retrievalContexts ||
      DEFAULT_RETRIEVAL_CONTEXTS
  );

  // We shouldn't actually do this once (ie, initialize state from redux) once students can update these,
  // but leaving as-is temporarily until we are set up to allow a user to update these initial values
  // and store them in redux.
  const [messages, setMessages] = useState<string[]>(retrievalContexts.value);
  const [newMessage, setNewMessage] = useState('');

  const onAdd = () => {
    setMessages([...messages, newMessage]);
    setNewMessage('');
    document.getElementById('retrieval-input')?.focus();
  };

  const onRemove = (index: number) => {
    const messagesCopy = [...messages];
    messagesCopy.splice(index, 1);
    setMessages(messagesCopy);
  };

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
          />
        </div>
        <div className={styles.addItemContainer}>
          <button type="button" onClick={onAdd} disabled={!newMessage}>
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
        <button type="button">Update</button>
      </div>
    </div>
  );
};

export default RetrievalCustomization;
