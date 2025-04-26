import React from 'react';

import {RadioButtonsGroup} from '@code-dot-org/component-library/radioButton';
import {BodyTwoText} from '@code-dot-org/component-library/typography';

import moduleStyles from './multipleChoice.module.scss';

const MultipleChoice: React.FunctionComponent = ({multipleChoice}) => {
  return (
    <div className={moduleStyles.multipleChoiceGroup}>
      <BodyTwoText>{multipleChoice.question}</BodyTwoText>
      <RadioButtonsGroup
        radioButtons={multipleChoice.choices.map((choice, i) => ({
          name: `choice-${i}`,
          label: choice.text,
          value: `choice-${i}`,
        }))}
      />
    </div>
  );
};

export default MultipleChoice;
