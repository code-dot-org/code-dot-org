import {Box, Stack, Alert} from '@mui/material';
import React from 'react';
import {useSelector} from 'react-redux';

import {WorkshopAdmin} from '../../permission';
import {useWorkshopContext} from '../context/WorkshopContext';

import {WorkshopInformationSection} from './sections/WorkshopInformationSection';

export const WorkshopOverview: React.FC = () => {
  const {workshop} = useWorkshopContext();
  const permission = useSelector(
    (state: {
      workshopDashboard: {permission: {has: (permission: string) => boolean}};
    }) => state.workshopDashboard.permission
  );
  const isWorkshopAdmin = permission.has(WorkshopAdmin);

  if (!workshop) {
    return (
      <Box>
        <Alert severity="warning">No workshop data available</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={3}>
        <WorkshopInformationSection
          workshop={workshop}
          isWorkshopAdmin={isWorkshopAdmin}
        />
      </Stack>
    </Box>
  );
};
