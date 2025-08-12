import Alert from '@code-dot-org/component-library/alert';
import {Box, Stack} from '@mui/material';
import React from 'react';
import {useSelector} from 'react-redux';

import {WorkshopAdmin} from '../../permission';
import {useWorkshopContext} from '../context/WorkshopContext';

import {WorkshopInformationSection} from './sections/WorkshopInformationSection';
import {WorkshopLinksSection} from './sections/WorkshopLinksSection';

export const WorkshopOverview: React.FC = () => {
  const {workshop} = useWorkshopContext();
  const permission = useSelector(
    (state: {
      workshopDashboard: {permission: {has: (permission: string) => boolean}};
    }) => state.workshopDashboard.permission
  );
  const isWorkshopAdmin = permission.has(WorkshopAdmin);

  if (!workshop) {
    return <Alert size="m" text="Workshop not found" type="warning" />;
  }

  return (
    <Box>
      <Stack spacing={3}>
        <WorkshopInformationSection
          workshop={workshop}
          isWorkshopAdmin={isWorkshopAdmin}
        />
        <WorkshopLinksSection workshop={workshop} />
      </Stack>
    </Box>
  );
};
