import React, {FC} from 'react';
import {Outlet} from 'react-router-dom';

import {SurveyCategorySelectionProps} from '../../types';
import {SurveyCategorySelection} from '../components/SurveyCategorySelection';

export const PostSurvey: FC<SurveyCategorySelectionProps> = props => {
  return (
    <>
      <SurveyCategorySelection {...props} />
      <Outlet />
    </>
  );
};
