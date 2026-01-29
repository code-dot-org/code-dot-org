import {Typography} from '@mui/material';
import React from 'react';

import {CFULevel, CFULevelResponseResponse} from '../../types';

interface CFUMatchAnswerProps {
  level: CFULevel;
  response: CFULevelResponseResponse;
}

const CFUMatchAnswer: React.FC<CFUMatchAnswerProps> = ({level, response}) => (
  <Typography variant="body4">
    {/* TODO: Render matching student answer for {level.name} */}
    Matching answer placeholder
  </Typography>
);

export default CFUMatchAnswer;
