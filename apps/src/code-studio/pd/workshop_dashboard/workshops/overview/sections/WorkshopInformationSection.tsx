import {Button, buttonColors} from '@code-dot-org/component-library/button';
import {
  Heading2,
  BodyFourText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {Card, CardContent, CardHeader, Box, Divider} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import classNames from 'classnames';
import moment from 'moment-timezone';
import React from 'react';
import {useNavigate} from 'react-router-dom';

import {WorkshopCourseConfigs} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

import {TIME_FORMAT} from '../../../workshopConstants';
import {WorkshopData} from '../../types';

import styles from '../../workshop.module.scss';

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
            <Heading2 visualAppearance="body-two" noMargin>
              <StrongText>Workshop Information</StrongText>
            </Heading2>
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
                <StrongText>Workshop Name</StrongText>
              </Box>
              <BodyFourText noMargin>
                {workshop.name || workshop.course}
              </BodyFourText>
            </Box>

            <Box>
              <Box className={styles.labelRow}>
                <StrongText>Subject/Topics</StrongText>
              </Box>
              <Box component="ul" className={styles.unstyledList}>
                {workshop.subject && (
                  <Box component="li">
                    <BodyFourText>{workshop.subject}</BodyFourText>
                  </Box>
                )}
                {workshop.courseOfferingNames &&
                  workshop.courseOfferingNames.split(', ').map(course => (
                    <Box
                      component="li"
                      key={course}
                      className={styles.subjectListItem}
                    >
                      <BodyFourText noMargin>{course}</BodyFourText>
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
                <StrongText>Date</StrongText>
                <StrongText>Time</StrongText>
                <StrongText>Location Name</StrongText>
              </Box>

              {workshop.sessions.map(session => (
                <Box key={session.id} className={styles.sessionRow}>
                  <BodyFourText noMargin>
                    {moment.tz(session.start, timeZone).format('MM/DD/YYYY')}
                  </BodyFourText>
                  <BodyFourText noMargin>
                    {moment.tz(session.start, timeZone).format(TIME_FORMAT)} -{' '}
                    {moment.tz(session.end, timeZone).format(TIME_FORMAT)}
                  </BodyFourText>
                  <BodyFourText noMargin>
                    {session.sessionFormat === 'in_person'
                      ? session.locationName ?? 'N/A'
                      : 'Virtual'}
                  </BodyFourText>
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
                <StrongText>Facilitators</StrongText>
              </Box>
              {workshop.facilitators?.length ? (
                workshop.facilitators.map(facilitator => (
                  <BodyFourText noMargin key={facilitator.id}>
                    {facilitator.name}, {facilitator.email}
                  </BodyFourText>
                ))
              ) : (
                <BodyFourText noMargin>N/A</BodyFourText>
              )}
            </Box>

            <Box>
              <Box className={styles.labelRow}>
                <StrongText>Regional Partner</StrongText>
              </Box>
              <BodyFourText noMargin>
                {workshop.regionalPartnerName || 'N/A'}
              </BodyFourText>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
