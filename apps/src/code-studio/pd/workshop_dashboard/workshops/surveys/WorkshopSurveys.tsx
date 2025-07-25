import React, {FC} from 'react';
import {Outlet} from 'react-router-dom';

import {SurveyTypeSelectionProps} from '../types';

import {SurveyTypeSelection} from './components/SurveyTypeSelection';

export const WorkshopSurveys: FC<SurveyTypeSelectionProps> = props => {
  return (
    <>
      <SurveyTypeSelection {...props} />
      <Outlet />
    </>
  );
};
