import React from 'react';

import Chips from '@cdo/apps/componentLibrary/chips';

import {ChatChoice} from './types';

interface ChoiceChipsProps {
  choices: ChatChoice[];
  selectChoices: (ids: string[]) => void;
}

const ChatMessage: React.FC<ChoiceChipsProps> = ({choices, selectChoices}) => {
  return (
    <Chips
      options={choices.map((choice: ChatChoice, id: number) => {
        return {label: choice.text, value: `${id}`};
      })}
      values={choices.map((choice: ChatChoice, id: number) => {
        return choice.selected ? `${id}` : '';
      })}
      setValues={selectChoices}
      name={'fnord'}
      size={'s'}
      textThickness={'thick'}
    />
  );
};

export default ChatMessage;
