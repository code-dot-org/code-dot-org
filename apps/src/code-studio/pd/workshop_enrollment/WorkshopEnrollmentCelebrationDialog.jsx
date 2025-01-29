import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';
import LinkButton from '@cdo/apps/componentLibrary/button/LinkButton';
import Typography, {
  Heading2,
  Heading3,
  Heading6,
  BodyTwoText,
} from '@cdo/apps/componentLibrary/typography';
import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import i18n from '@cdo/locale';

import style from '@cdo/apps/code-studio/pd/professional_learning_landing/landingPage.module.scss';

const CelebrationImage = require('@cdo/static/pd/EnrollmentCelebration.png');

export const buildGoogleCalendarLink = (
  session,
  workshopTitle,
  workshopLocation
) => {
  const date = `${session.year}${session.month}${session.day}`;
  const startTime = `${date}T${session.start_hour}${session.start_min}00`;
  const endTime = `${date}T${session.end_hour}${session.end_min}00`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    workshopTitle
  )}&location=${encodeURIComponent(
    workshopLocation
  )}&dates=${startTime}/${endTime}`;
};

export const buildOutlookCalendarLink = (
  session,
  workshopTitle,
  workshopLocation
) => {
  const date = `${session.year}-${session.month}-${session.day}`;
  const startTime = `${date}T${session.start_hour}:${session.start_min}:00`;
  const endTime = `${date}T${session.end_hour}:${session.end_min}:00`;

  return `https://outlook.live.com/calendar/action/compose?rru=addevent&subject=${encodeURIComponent(
    workshopTitle
  )}&location=${encodeURIComponent(
    workshopLocation
  )}&startdt=${startTime}&enddt=${endTime}`;
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

  const onCloseSessionCalendarDialog = () => {
    setMultipleSessionDialogType('');
    onCloseCelebrationDialog();
  };

  const getCalendarLink = (session, calendarType) => {
    if (calendarType === 'Google') {
      return buildGoogleCalendarLink(session, workshopTitle, workshopLocation);
    } else if (calendarType === 'Outlook') {
      return buildOutlookCalendarLink(session, workshopTitle, workshopLocation);
    }
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
                <th>
                  <Heading6>{i18n.date()}</Heading6>
                </th>
                <th>
                  <Heading6>{i18n.time()}</Heading6>
                </th>
                <th />
              </tr>
            </thead>
            <tbody>
              {workshopSessionInfo.map((session, index) => (
                <tr key={`session-${index}`}>
                  <td>
                    <BodyTwoText>{session.date_text}</BodyTwoText>
                  </td>
                  <td>
                    <BodyTwoText>{session.time_text}</BodyTwoText>
                  </td>
                  <td>
                    <LinkButton
                      text={i18n.enrollmentCelebrationAddToCalendarButton()}
                      ariaLabel={i18n.addToCalendarType({
                        calendar_type: multipleSessionDialogType,
                      })}
                      type={'secondary'}
                      color={'black'}
                      iconLeft={{iconName: 'fa-solid fa-plus'}}
                      className={style.addSessionToCalendarButton}
                      target="_blank"
                      href={getCalendarLink(session, multipleSessionDialogType)}
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
              onClick={onCloseSessionCalendarDialog}
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
                        <LinkButton
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
                          target="_blank"
                          href={getCalendarLink(
                            workshopSessionInfo[0],
                            'Google'
                          )}
                        />
                        <LinkButton
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
                          target="_blank"
                          href={getCalendarLink(
                            workshopSessionInfo[0],
                            'Outlook'
                          )}
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
  workshopSessionInfo: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func,
};
