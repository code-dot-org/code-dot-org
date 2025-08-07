import {Box, Stack, CircularProgress, Alert} from '@mui/material';
import React from 'react';

import {useWorkshopContext} from '../context/WorkshopContext';

import {TakeAttendanceSection} from './sections/TakeAttendanceSection';
import {WorkshopInformationSection} from './sections/WorkshopInformationSection';
import {WorkshopLinksSection} from './sections/WorkshopLinksSection';
import {WorkshopStatusSection} from './sections/WorkshopStatusSection';

export const WorkshopOverview: React.FC = () => {
  const {workshop, loading, error, loadWorkshop} = useWorkshopContext();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">Error loading workshop: {error}</Alert>
      </Box>
    );
  }

  if (!workshop) {
    return (
      <Box p={2}>
        <Alert severity="warning">No workshop data available</Alert>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Stack spacing={3}>
        <WorkshopInformationSection workshop={workshop} />
        <WorkshopLinksSection workshop={workshop} />
        <WorkshopStatusSection
          workshop={workshop}
          onWorkshopUpdate={loadWorkshop}
        />
        <TakeAttendanceSection workshop={workshop} />
      </Stack>
    </Box>
  );
};
