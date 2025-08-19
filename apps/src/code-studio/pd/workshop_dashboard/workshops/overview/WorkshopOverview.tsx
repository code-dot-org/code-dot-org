import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Box, Stack} from '@mui/material';
import React from 'react';
import {useSelector} from 'react-redux';

import {WorkshopAdmin} from '../../permission';
import {useWorkshopContext} from '../WorkshopLayout';

import {TakeAttendanceSection} from './sections/TakeAttendanceSection';
import {WorkshopInformationSection} from './sections/WorkshopInformationSection';
import {WorkshopLinksSection} from './sections/WorkshopLinksSection';
import {WorkshopStatusSection} from './sections/WorkshopStatusSection';

export const WorkshopOverview: React.FC = () => {
  const permission = useSelector(
    (state: {
      workshopDashboard: {permission: {has: (permission: string) => boolean}};
    }) => state.workshopDashboard.permission
  );
  const isWorkshopAdmin = permission.has(WorkshopAdmin);

  const {workshop, workshopLoading, workshopError, refetchWorkshop} =
    useWorkshopContext();

  if (!workshop && workshopLoading) {
    return <FontAwesomeV6Icon iconName="spinner" animationType="spin" />;
  }

  if (workshopError) {
    return <Alert size="m" text="Workshop not found" type="danger" />;
  }

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
        <TakeAttendanceSection workshop={workshop} />
      </Stack>
    </Box>
  );
};
