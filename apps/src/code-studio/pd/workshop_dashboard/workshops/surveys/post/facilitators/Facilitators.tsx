import React, {FC} from 'react';
import {Outlet} from 'react-router-dom';

import {FacilitatorSelection} from './components/FacilitatorSelection';

export const Facilitators: FC = () => {
  return (
    <>
      <FacilitatorSelection />
      <Outlet />
    </>
  );
};
