import Button from '@code-dot-org/component-library/button';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Typography, {
  Heading2,
  Heading3,
  Heading6,
  BodyTwoText,
} from '@cdo/apps/componentLibrary/typography';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import i18n from '@cdo/locale';

import style from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage.module.scss';

const CelebrationImage = require('@cdo/static/pd/EnrollmentCelebration.png');

const MonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Ensures the given value is two digits long (padded with a '0' if necessary)
// so that time intervals are always two digits long.
const zeroPad = value => {
  return value.toString().padStart(2, '0');
};

const generateDateText = session => {
  const date = new Date(session.start);
  return `${
    MonthNames[date.getUTCMonth()]
  } ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

const generateTimeText = session => {
  const start = new Date(session.start);
  const end = new Date(session.end);

  const startTimeText = start
    .toLocaleString('en-US', {
      timeZone: 'utc',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
    .replaceAll(' ', '');
  const endTimeText = end
    .toLocaleString('en-US', {
      timeZone: 'utc',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
    .replaceAll(' ', '');

  return `${startTimeText} - ${endTimeText}`;
};

export const buildAppleCalendarLink = (
  workshopSessions,
  workshopTitle,
  workshopLocation
) => {
  let icsFileContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'CALSCALE:GREGORIAN',
    `PRODID:${workshopTitle}${workshopSessions[0].start}/ics`,
  ];

  workshopSessions.forEach(session => {
    const start = new Date(session.start);
    const end = new Date(session.end);
    // Calendars parse a month of '01' as January, while Javascript's Date class parses a month of '00'
    // as January, so the month needs to be offset by 1.
    const date = `${start.getUTCFullYear()}${zeroPad(
      start.getUTCMonth() + 1
    )}${zeroPad(start.getUTCDate())}`;
    const startTime = `${date}T${zeroPad(start.getUTCHours())}${zeroPad(
      start.getUTCMinutes()
    )}00`;
    const endTime = `${date}T${zeroPad(end.getUTCHours())}${zeroPad(
      end.getUTCMinutes()
    )}00`;

    icsFileContent.push(
      'BEGIN:VEVENT',
      `DTSTAMP:${startTime}`,
      `UID:${workshopTitle}${startTime}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `SUMMARY:${workshopTitle}`,
      `LOCATION:${workshopLocation}`,
      'END:VEVENT'
    );
  });

  icsFileContent.push('END:VCALENDAR');
  const icsFileAsString = icsFileContent.join('\n');

  const blob = new Blob([icsFileAsString], {
    type: 'text/calendar;charset=utf-8',
  });
  return URL.createObjectURL(blob);
};

export const buildGoogleCalendarLink = (
  session,
  workshopTitle,
  workshopLocation
) => {
  const start = new Date(session.start);
  const end = new Date(session.end);
  // Calendars parse a month of '01' as January, while Javascript's Date class parses a month of '00'
  // as January, so the month needs to be offset by 1.
  const date = `${start.getUTCFullYear()}${zeroPad(
    start.getUTCMonth() + 1
  )}${zeroPad(start.getUTCDate())}`;
  const startTime = `${date}T${zeroPad(start.getUTCHours())}${zeroPad(
    start.getUTCMinutes()
  )}00`;
  const endTime = `${date}T${zeroPad(end.getUTCHours())}${zeroPad(
    end.getUTCMinutes()
  )}00`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    workshopTitle
  )}&location=${encodeURIComponent(
    workshopLocation
  )}&dates=${encodeURIComponent(startTime)}/${encodeURIComponent(endTime)}`;
};

export const buildOutlookCalendarLink = (
  session,
  workshopTitle,
  workshopLocation
) => {
  const start = new Date(session.start);
  const end = new Date(session.end);
  // Calendars parse a month of '01' as January, while Javascript's Date class parses a month of '00'
  // as January, so the month needs to be offset by 1.
  const date = `${start.getUTCFullYear()}-${zeroPad(
    start.getUTCMonth() + 1
  )}-${zeroPad(start.getUTCDate())}`;
  const startTime = `${date}T${zeroPad(start.getUTCHours())}:${zeroPad(
    start.getUTCMinutes()
  )}:00`;
  const endTime = `${date}T${zeroPad(end.getUTCHours())}:${zeroPad(
    end.getUTCMinutes()
  )}:00`;

  return `https://outlook.live.com/calendar/action/compose?rru=addevent&subject=${encodeURIComponent(
    workshopTitle
  )}&location=${encodeURIComponent(
    workshopLocation
  )}&startdt=${encodeURIComponent(startTime)}&enddt=${encodeURIComponent(
    endTime
  )}`;
};

export default function WorkshopEnrollmentCelebrationDialog({
  workshopTitle,
  workshopLocation,
  workshopSessionInfo,
  onClose,
}) {
  const hasMultipleSessions =
    workshopSessionInfo && workshopSessionInfo.length > 1;
  const [isOpen, setIsOpen] = useState(true);
  const [multipleSessionDialogType, setMultipleSessionDialogType] =
    useState('');

  const onCloseCelebrationDialog = () => {
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
  };

  const onCloseBothDialogs = () => {
    setMultipleSessionDialogType('');
    onCloseCelebrationDialog();
  };

  const getCalendarLink = (session, calendarType) => {
    if (calendarType === 'Google') {
      return buildGoogleCalendarLink(session, workshopTitle, workshopLocation);
    } else if (calendarType === 'Outlook') {
      return buildOutlookCalendarLink(session, workshopTitle, workshopLocation);
    } else if (calendarType === 'Apple') {
      return buildAppleCalendarLink(session, workshopTitle, workshopLocation);
    }
  };

  const onClickAddToCalendar = (session, calendarType) => {
    analyticsReporter.sendEvent(
      EVENTS.WORKSHOP_ADD_SESSION_TO_CALENDAR_CLICK_EVENT,
      {'calendar type': calendarType}
    );

    window.open(
      getCalendarLink(session, calendarType),
      '_blank',
      'noopener',
      'noreferrer'
    );
  };

  const RenderCalendarSessionDialog = () => {
    return (
      <AccessibleDialog
        className={style.celebrationContainer}
        onClose={() => setMultipleSessionDialogType('')}
        closeOnClickBackdrop={true}
      >
        <div className={style.showMultipleSessionDialogContainer}>
          <Heading3>{i18n.enrollmentCelebrationAddToCalendarTitle()}</Heading3>
          <hr />
          <BodyTwoText>
            {i18n.enrollmentCelebrationAddToCalendarDesc()}
          </BodyTwoText>
          <table>
            <thead>
              <tr>
                <th className={style.calendarTableHeaderCell}>
                  <Heading6>{i18n.date()}</Heading6>
                </th>
                <th className={style.calendarTableHeaderCell}>
                  <Heading6>{i18n.time()}</Heading6>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {workshopSessionInfo.map(session => (
                <tr key={`session-${session.id}`}>
                  <td>
                    <BodyTwoText>{generateDateText(session)}</BodyTwoText>
                  </td>
                  <td>
                    <BodyTwoText>{generateTimeText(session)}</BodyTwoText>
                  </td>
                  <td>
                    <Button
                      text={i18n.enrollmentCelebrationAddToCalendarButton()}
                      ariaLabel={i18n.addToCalendarType({
                        calendar_type: multipleSessionDialogType,
                      })}
                      type={'secondary'}
                      color={'black'}
                      iconLeft={{iconName: 'fa-solid fa-plus'}}
                      className={style.addSessionToCalendarButton}
                      onClick={() =>
                        onClickAddToCalendar(session, multipleSessionDialogType)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr />
          <div className={style.closeMultipleSessionDialogContainer}>
            <Button
              text={i18n.enrollmentCelebrationChangeCalendarButton()}
              type={'secondary'}
              color={'black'}
              iconLeft={{iconName: 'fa-solid fa-arrow-left'}}
              onClick={() => setMultipleSessionDialogType('')}
            />
            <Button
              text={i18n.enrollmentCelebrationCallToAction()}
              type={'primary'}
              onClick={onCloseBothDialogs}
            />
          </div>
        </div>
      </AccessibleDialog>
    );
  };

  return (
    isOpen && (
      <AccessibleDialog
        className={style.celebrationContainer}
        onClose={onCloseCelebrationDialog}
        closeOnClickBackdrop={true}
      >
        <>
          {multipleSessionDialogType && RenderCalendarSessionDialog()}
          <div className={style.dialogContainer}>
            <div className={style.contentContainer}>
              <img src={CelebrationImage} alt="" />
              <Heading2>{i18n.enrollmentCelebrationTitle()}</Heading2>
              <BodyTwoText>
                {i18n.enrollmentCelebrationBody({workshopName: workshopTitle})}
              </BodyTwoText>
              {workshopSessionInfo && (
                <div className={style.calendarButtonContainer}>
                  <Typography
                    semanticTag={'h3'}
                    visualAppearance={'overline-two'}
                  >
                    {i18n.addToYourCalendar()}
                  </Typography>
                  <div className={style.calendarButtons}>
                    <Button
                      text={'Apple'}
                      ariaLabel={i18n.addToCalendarType({
                        calendar_type: 'Apple',
                      })}
                      type={'secondary'}
                      color={'black'}
                      iconLeft={{
                        iconName: 'brands fa-apple',
                        iconStyle: 'light',
                      }}
                      onClick={() =>
                        onClickAddToCalendar(workshopSessionInfo, 'Apple')
                      }
                    />
                    {hasMultipleSessions ? (
                      <>
                        <Button
                          text={'Google'}
                          type={'secondary'}
                          color={'black'}
                          iconLeft={{
                            iconName: 'brands fa-google',
                            iconStyle: 'light',
                          }}
                          onClick={() => setMultipleSessionDialogType('Google')}
                        />
                        <Button
                          text={'Outlook'}
                          type={'secondary'}
                          color={'black'}
                          iconLeft={{
                            iconName: 'brands fa-microsoft',
                            iconStyle: 'light',
                          }}
                          onClick={() =>
                            setMultipleSessionDialogType('Outlook')
                          }
                        />
                      </>
                    ) : (
                      <>
                        <Button
                          text={'Google'}
                          ariaLabel={i18n.addToCalendarType({
                            calendar_type: 'Google',
                          })}
                          type={'secondary'}
                          color={'black'}
                          iconLeft={{
                            iconName: 'brands fa-google',
                            iconStyle: 'light',
                          }}
                          onClick={() =>
                            onClickAddToCalendar(
                              workshopSessionInfo[0],
                              'Google'
                            )
                          }
                        />
                        <Button
                          text={'Outlook'}
                          ariaLabel={i18n.addToCalendarType({
                            calendar_type: 'Outlook',
                          })}
                          type={'secondary'}
                          color={'black'}
                          iconLeft={{
                            iconName: 'brands fa-microsoft',
                            iconStyle: 'light',
                          }}
                          onClick={() =>
                            onClickAddToCalendar(
                              workshopSessionInfo[0],
                              'Outlook'
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={onCloseCelebrationDialog}
              text={i18n.enrollmentCelebrationCallToAction()}
            />
          </div>
        </>
      </AccessibleDialog>
    )
  );
}

WorkshopEnrollmentCelebrationDialog.propTypes = {
  workshopTitle: PropTypes.string,
  workshopLocation: PropTypes.string,
  workshopSessionInfo: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
    })
  ),
  onClose: PropTypes.func,
};
