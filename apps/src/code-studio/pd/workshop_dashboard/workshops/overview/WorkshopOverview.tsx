import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Box, Stack} from '@mui/material';
import React from 'react';
import {useSelector} from 'react-redux';
import {useOutletContext} from 'react-router-dom';

import {UseFetchResult} from '@cdo/apps/util/useFetch';

import {WorkshopAdmin} from '../../permission';
import {Workshop} from '../../WorkshopFormTemplate/types';
import {WorkshopData} from '../types';

import {TakeAttendanceSection} from './sections/TakeAttendanceSection';
import {WorkshopInformationSection} from './sections/WorkshopInformationSection';
import {WorkshopLinksSection} from './sections/WorkshopLinksSection';

export const WorkshopOverview: React.FC = () => {
  const permission = useSelector(
    (state: {
      workshopDashboard: {permission: {has: (permission: string) => boolean}};
    }) => state.workshopDashboard.permission
  );
  const isWorkshopAdmin = permission.has(WorkshopAdmin);

  const {workshop, loading, error} = useOutletContext<
    Omit<UseFetchResult<Workshop>, 'data'> & {
      workshop: WorkshopData;
    }
  >();

  if (!workshop && loading) {
    return <FontAwesomeV6Icon iconName="spinner" animationType="spin" />;
  }

  if (error) {
    return <Alert size="m" text="Workshop not found" type="warning" />;
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
        <TakeAttendanceSection workshop={workshop} />
      </Stack>
    </Box>
  );
};
