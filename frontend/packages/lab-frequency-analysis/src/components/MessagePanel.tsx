import React, {useState, MutableRefObject} from 'react';

import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';

import {FrequencyData, FrequencyMessageData} from '../types';

import Message from './Message';

import moduleStyles from './frequencyLevel.module.scss';

export interface MessagePanelProps {
  state: string;
  frequencyData: MutableRefObject<FrequencyData>;
  messages: FrequencyMessageData[];
  /** Callback for when the message data changes */
  onUpdate?: () => void;
}

const MessagePanel: React.FunctionComponent<MessagePanelProps> = ({
  state,
  frequencyData,
  messages,
  onUpdate,
}) => {
  const [message, setMessage] = useState<string | undefined>(
    messages[0]?.message,
  );

  return (
    <div className={moduleStyles.messagePane}>
      {messages?.length > 1 && (
        <SimpleDropdown
          name="Message chooser"
          className={moduleStyles.messageDropdown}
          labelText="Choose a message"
          items={(messages || []).map((item, i) => ({
            value: i.toString(),
            text: item.title,
          }))}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            const index = parseInt(event.target.value);
            setMessage(messages[index]?.message);
          }}
        />
      )}
      <Message
        message={message}
        state={state}
        frequencyData={frequencyData}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default MessagePanel;
