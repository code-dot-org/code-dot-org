import React, {useState} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';

const RetrievalCustomization = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const onAdd = () => {
    setMessages([...messages, newMessage]);
    setNewMessage('');
    document.getElementById('retrieval-input').focus();
  };

  const onRemove = index => {
    const messagesCopy = [...messages];
    messagesCopy.splice(index, 1);
    setMessages(messagesCopy);
  };

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <div className={styles.inputContainer}>
          <label htmlFor="system-prompt">
            <StrongText>Retrieval</StrongText>
          </label>
          <textarea
            id="retrieval-input"
            onChange={event => setNewMessage(event.target.value)}
            value={newMessage}
          />
        </div>
        <button type="button" onClick={onAdd} disabled={!newMessage}>
          Add
        </button>
        {messages.map((message, index) => {
          return (
            <div key={index}>
              <button type="button" onClick={() => onRemove(index)}>
                <FontAwesomeV6Icon iconName="circle-xmark" />
              </button>
              <span style={{backgroundColor: 'gray'}}>{message}</span>
            </div>
          );
        })}
      </div>
      <div className={styles.footerButtonContainer}>
        <button type="button">Update</button>
      </div>
    </div>
  );
};

export default RetrievalCustomization;
