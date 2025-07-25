import React, {FC} from 'react';
import {Outlet} from 'react-router-dom';

import {WorkshopTabs} from './components/WorkshopTabs';
import {WorkshopProps} from './types';

export const Workshop: FC<WorkshopProps> = props => {
  return (
    <>
      <WorkshopTabs {...props} />
      <Outlet />
    </>
  );
};
