import React, {useState} from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

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
    <>
      <label htmlFor="system-prompt">Retrieval</label>
      <textarea
        id="retrieval-input"
        onChange={event => setNewMessage(event.target.value)}
        value={newMessage}
      />
      <button type="button" onClick={onAdd} disabled={!newMessage}>
        Add
      </button>
      {messages.map((message, index) => {
        return (
          <div key={index}>
            <button type="button" onClick={() => onRemove(index)}>
              <FontAwesomeV6Icon iconName="x" />
            </button>
            {message}
          </div>
        );
      })}
    </>
  );
};

export default RetrievalCustomization;
