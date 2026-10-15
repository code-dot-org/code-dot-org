import {Button as MuiButton} from '@mui/material';
import React from 'react';

import moduleStyles from '../sprite-lab2-view.module.scss';

interface ChoiceBarProps {
  choices: string[];
  onChoose: (choice: string) => void;
}

/** The program's choices as buttons across the foot of the game; picking
    one hands it to the program and the bar goes. */
const ChoiceBar: React.FunctionComponent<ChoiceBarProps> = ({
  choices,
  onChoose,
}) => (
  <div className={moduleStyles.choiceBar} role="group" aria-label="Choices">
    {choices.map(choice => (
      <MuiButton
        key={choice}
        type="button"
        variant="contained"
        color="primary"
        size="small"
        className={moduleStyles.choiceButton}
        onClick={() => onChoose(choice)}
      >
        {choice}
      </MuiButton>
    ))}
  </div>
);

export default ChoiceBar;
