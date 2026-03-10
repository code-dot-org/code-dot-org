import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import classNames from 'classnames';
import moment from 'moment-timezone';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {TIME_FORMAT} from '../../../workshopConstants';
import {WorkshopData} from '../../types';

import styles from '../../WorkshopLayout.module.scss';

interface WorkshopInformationSectionProps {
  workshop: WorkshopData;
  isWorkshopAdmin: boolean;
}

export const WorkshopInformationSection: React.FC<
  WorkshopInformationSectionProps
> = ({workshop, isWorkshopAdmin}) => {
  const isLargeScreen = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();

  const timeZone = workshop.timeZone
    ? Intl.DateTimeFormat().resolvedOptions().timeZone
    : 'UTC';

  const handleEditClick = () => {
    navigate('edit');
  };

  const canEdit = workshop.state === 'Not Started' || isWorkshopAdmin;
  const canShowEditButton = WorkshopCourseConfigs.some(
    config => config.label === workshop.course
  );

  return (
    <Card className={styles.card}>
      <CardHeader
        className={styles.cardHeader}
        title={
          <Box className={styles.cardHeaderContainer}>
            <Typography component="h2" variant="body2">
              <Typography variant="strong">Workshop Information</Typography>
            </Typography>
            {canEdit && canShowEditButton && (
              <Button
                text={isWorkshopAdmin ? 'Edit (admin)' : 'Edit'}
                size="xs"
                type="secondary"
                color={buttonColors.gray}
                onClick={handleEditClick}
              />
            )}
          </Box>
        }
      />
      <CardContent className={styles.cardContent}>
        <Box className={styles.sectionContainer}>
          {/* Workshop Name and Subjects */}
          <Box className={styles.column}>
            <Box>
              <Box className={styles.labelRow}>
                <Typography variant="strong">Workshop Name</Typography>
              </Box>
              <Typography variant="body4">
                {workshop.name || workshop.course}
              </Typography>
            </Box>

            <Box>
              <Box className={styles.labelRow}>
                <Typography variant="strong">Subject/Topics</Typography>
              </Box>
              <Box component="ul" className={styles.unstyledList}>
                {workshop.subject && (
                  <Box component="li">
                    <Typography variant="body4" gutterBottom>
                      {workshop.subject}
                    </Typography>
                  </Box>
                )}
                {workshop.courseOfferingNames &&
                  workshop.courseOfferingNames.split(', ').map(course => (
                    <Box
                      component="li"
                      key={course}
                      className={styles.subjectListItem}
                    >
                      <Typography variant="body4">{course}</Typography>
                    </Box>
                  ))}
              </Box>
            </Box>
          </Box>

          <Divider
            className={styles.divider}
            orientation={isLargeScreen ? 'vertical' : 'horizontal'}
            flexItem
          />

          {/* Session Date, Time, and Location */}
          <Box className={styles.column}>
            <Box>
              <Box className={classNames(styles.labelRow, styles.sessionRow)}>
                <Typography variant="strong">Date</Typography>
                <Typography variant="strong">Time</Typography>
                <Typography variant="strong">Location Name</Typography>
              </Box>

              {workshop.sessions.map(session => (
                <Box key={session.id} className={styles.sessionRow}>
                  <Typography variant="body4">
                    {moment.tz(session.start, timeZone).format('MM/DD/YYYY')}
                  </Typography>
                  <Typography variant="body4">
                    {moment.tz(session.start, timeZone).format(TIME_FORMAT)} -{' '}
                    {moment.tz(session.end, timeZone).format(TIME_FORMAT)}
                  </Typography>
                  <Typography variant="body4">
                    {session.sessionFormat === 'in_person'
                      ? session.locationName ?? 'N/A'
                      : 'Virtual'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider
            className={styles.divider}
            orientation={isLargeScreen ? 'vertical' : 'horizontal'}
            flexItem
          />

          {/* Facilitators and Regional Partner */}
          <Box className={styles.column}>
            <Box>
              <Box className={styles.labelRow}>
                <Typography variant="strong">Facilitators</Typography>
              </Box>
              {workshop.facilitators?.length ? (
                workshop.facilitators.map(facilitator => (
                  <Typography key={facilitator.id} variant="body4">
                    {facilitator.name}, {facilitator.email}
                  </Typography>
                ))
              ) : (
                <Typography variant="body4">N/A</Typography>
              )}
            </Box>

            <Box>
              <Box className={styles.labelRow}>
                <Typography variant="strong">Regional Partner</Typography>
              </Box>
              <Typography variant="body4">
                {workshop.regionalPartnerName || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
