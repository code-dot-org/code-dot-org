/* eslint-disable import/order */
import React, {useState, useCallback} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';
import styles from './retrieval-customization.module.scss';

const RetrievalCustomization: React.FunctionComponent = () => {
  const [messages, setMessages] = useState<string[]>([]);
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
