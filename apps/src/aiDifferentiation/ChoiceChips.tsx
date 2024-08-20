import React from 'react';

import Chips from '@cdo/apps/componentLibrary/chips';

import {ChatChoice} from './types';

import style from './ai-differentiation.module.scss';

interface ChoiceChipsProps {
  choices: ChatChoice[];
  selectChoices: (ids: string[]) => void;
}

// TODO: Merge this with the shared suggestedPrompt component that currently
// does not use the component library chips.
const ChoiceChips: React.FC<ChoiceChipsProps> = ({choices, selectChoices}) => {
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
      className={style.chips}
    />
  );
};

export default ChoiceChips;
