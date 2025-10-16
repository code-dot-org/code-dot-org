import {LinkButton, buttonColors} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
import {
  Heading2,
  BodyFourText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import React, {FC} from 'react';

import {getSessionDate} from '@cdo/apps/code-studio/pd/sessionDateUtils';

import {DATE_FORMAT, US_DATE_FORMAT} from '../../workshopConstants';
import {useWorkshopContext} from '../WorkshopLayout';

import styles from './WorkshopAttendance.module.scss';
import commonStyles from '../WorkshopLayout.module.scss';

export const WorkshopAttendance: FC = () => {
  const {workshop} = useWorkshopContext();

  if (!workshop) {
    return null;
  }

  return (
    <Card className={commonStyles.card}>
      <CardHeader
        className={commonStyles.cardHeader}
        title={
          <Box className={commonStyles.cardHeaderContainer}>
            <Heading2 visualAppearance="body-two" noMargin>
              <StrongText>Take Attendance</StrongText>
            </Heading2>
          </Box>
        }
      />
      <CardContent className={commonStyles.cardContent}>
        <Box className={commonStyles.sectionContainer}>
          <Box className={commonStyles.column}>
            <BodyFourText noMargin>
              There is a unique attendance URL for each day of your workshop. On
              each day of your workshop, your participants must visit that day's
              attendance URL to receive professional development credit. The
              attendance URL(s) will be shown below, 2 days in advance, for your
              convenience.
            </BodyFourText>
          </Box>
        </Box>

        <Box>
          <Table
            className={styles.attendanceTable}
            size="small"
            aria-label="Workshop attendance information"
          >
            <TableHead>
              <TableRow>
                <TableCell>
                  <BodyFourText noMargin>
                    <StrongText>Date</StrongText>
                  </BodyFourText>
                </TableCell>
                <TableCell>
                  <BodyFourText noMargin>
                    <StrongText>Attendance URL</StrongText>
                  </BodyFourText>
                </TableCell>
                <TableCell>
                  <BodyFourText noMargin>
                    <StrongText>View Daily Roster</StrongText>
                  </BodyFourText>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workshop.sessions.map(session => {
                const formattedDateMonthFirst = getSessionDate({
                  session,
                  format: US_DATE_FORMAT,
                  isLocal: !workshop.timeZone,
                });
                const formattedDate = getSessionDate({
                  session,
                  format: DATE_FORMAT,
                  isLocal: !workshop.timeZone,
                });
                const attendanceUrl = `/pd/attend/${session.code}`;
                const attendanceUrlFull = `${window.origin}${attendanceUrl}`;
                const rosterLabel = `Attendance for ${formattedDate}`;
                const rosterUrl = `/pd/workshop_dashboard/workshops/${workshop.id}/attendance/${session.id}`;

                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <BodyFourText noMargin>
                        {formattedDateMonthFirst}
                      </BodyFourText>
                    </TableCell>
                    <TableCell>
                      {session.showLink && (
                        <Link
                          text={attendanceUrlFull}
                          href={attendanceUrl}
                          openInNewTab
                          size="xs"
                          aria-label={`Open attendance URL for ${formattedDate} in new tab`}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <LinkButton
                        text={rosterLabel}
                        href={rosterUrl}
                        size="xs"
                        color={buttonColors.gray}
                        type="secondary"
                        target="_blank"
                        aria-label={`View daily roster for ${formattedDate} in new tab`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
};
