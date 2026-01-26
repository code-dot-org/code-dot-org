import {Typography} from '@mui/material';
import React from 'react';

import {CFULevel, CFULevelResponse} from '../../types';

interface CFUFreeResponseAnswerProps {
  level: CFULevel;
  response: CFULevelResponse;
}

const CFUFreeResponseAnswer: React.FC<CFUFreeResponseAnswerProps> = ({
  level,
  response,
}) => (
  <Typography variant="body4">
    {/* TODO: Render free response student answer for {level.name} */}
    Free response answer placeholder
  </Typography>
);

export default CFUFreeResponseAnswer;
