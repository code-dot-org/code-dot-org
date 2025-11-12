import {LinkButton, buttonColors} from '@code-dot-org/component-library/button';
import Link from '@code-dot-org/component-library/link';
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
  Typography,
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
            <Typography component="h2" variant="body2">
              <Typography variant="strong">Take Attendance</Typography>
            </Typography>
          </Box>
        }
      />
      <CardContent className={commonStyles.cardContent}>
        <Box className={commonStyles.sectionContainer}>
          <Box className={commonStyles.column}>
            <Typography variant="body4">
              There is a unique attendance URL for each day of your workshop. On
              each day of your workshop, your participants must visit that day's
              attendance URL to receive professional development credit. The
              attendance URL(s) will be shown below, 2 days in advance, for your
              convenience.
            </Typography>
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
                  <Typography variant="body4">
                    <Typography variant="strong">Date</Typography>
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body4">
                    <Typography variant="strong">Attendance URL</Typography>
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body4">
                    <Typography variant="strong">View Daily Roster</Typography>
                  </Typography>
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
                      <Typography variant="body4">
                        {formattedDateMonthFirst}
                      </Typography>
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
