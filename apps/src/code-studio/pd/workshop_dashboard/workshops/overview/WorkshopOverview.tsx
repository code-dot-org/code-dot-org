import {Box, Stack} from '@mui/material';
import React, {FC} from 'react';
import {useSelector} from 'react-redux';

import {WorkshopAdmin} from '../../permission';
import {useWorkshopContext} from '../WorkshopLayout';

import {WorkshopInformationSection} from './sections/WorkshopInformationSection';
import {WorkshopLinksSection} from './sections/WorkshopLinksSection';
import {WorkshopStatusSection} from './sections/WorkshopStatusSection';

export const WorkshopOverview: FC = () => {
  const permission = useSelector(
    (state: {
      workshopDashboard: {permission: {has: (permission: string) => boolean}};
    }) => state.workshopDashboard.permission
  );
  const isWorkshopAdmin = permission.has(WorkshopAdmin);

  const {workshop, refetchWorkshop} = useWorkshopContext();

  if (!workshop) {
    return null;
  }

  return (
    <Box>
      <Stack spacing={3}>
        <WorkshopInformationSection
          workshop={workshop}
          isWorkshopAdmin={isWorkshopAdmin}
        />
        <WorkshopLinksSection workshop={workshop} />
        <WorkshopStatusSection
          workshop={workshop}
          isWorkshopAdmin={isWorkshopAdmin}
          onWorkshopUpdate={refetchWorkshop}
        />
      </Stack>
    </Box>
  );
};
