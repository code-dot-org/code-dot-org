import {Typography} from '@mui/material';
import React from 'react';

import {CFULevel, CFULevelResponse} from '../../types';

interface CFUMultiAnswerProps {
  level: CFULevel;
  response: CFULevelResponse;
}

const CFUMultiAnswer: React.FC<CFUMultiAnswerProps> = ({level, response}) => (
  <Typography variant="body4">
    {/* TODO: Render multiple choice student answer for {level.name} */}
    Multiple choice answer placeholder
  </Typography>
);

export default CFUMultiAnswer;
