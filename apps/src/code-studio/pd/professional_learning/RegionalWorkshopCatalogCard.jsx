import {LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {
  BodyOneText,
  BodyTwoText,
  OverlineTwoText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {getSessionDate, getSessionTimes} from '../sessionDateUtils';

import style from './regionalWorkshopCatalog.module.scss';

const buildWorkshopStartText = sessions => {
  const firstSessionDate = getSessionDate({
    session: sessions[0],
    format: 'MM/DD/YY',
    isLocal: sessions[0].is_local,
  });
  const {startTime, endTime} = getSessionTimes({
    session: sessions[0],
    format: 'h:mmA',
    isLocal: sessions[0].is_local,
  });
  const firstSessionDateTime = `${firstSessionDate} (${startTime}-${endTime})`;

  return sessions.length > 1
    ? `${firstSessionDateTime} + ${sessions.length - 1} More`
    : firstSessionDateTime;
};

const RegionalWorkshopCatalogCard = ({
  id,
  course,
  subject,
  name,
  capacity,
  numEnrollments,
  sessions,
  format,
  locationName,
  fee,
  hasPrereq,
  requiresApplication,
  customApplicationLink,
  customRegistrationLink,
}) => {
  const seatsRemaining = capacity - numEnrollments;
  const isFull = seatsRemaining <= 0;

  // Show the apply button if applications are required, otherwise show the
  // enroll button. If the workshop has a third-party apply/enroll link then
  // use that one, otherwise default to our apply/enroll links.
  const RenderApplyOrEnrollButton = () => {
    if (requiresApplication) {
      return (
        <LinkButton
          aria-label="applyNow"
          text="Apply now"
          target="_blank"
          color="purple"
          iconRight={
            customApplicationLink ? {iconName: 'up-right-from-square'} : null
          }
          href={
            customApplicationLink
              ? customApplicationLink
              : '/pd/application/teacher'
          }
          className={style.wsCardButton}
          disabled={isFull}
        />
      );
    } else {
      return (
        <LinkButton
          aria-label="enrollNow"
          text="Enroll now"
          target="_blank"
          color="purple"
          iconRight={
            customRegistrationLink ? {iconName: 'up-right-from-square'} : null
          }
          href={
            customRegistrationLink
              ? customRegistrationLink
              : `/pd/workshops/${id}/enroll`
          }
          className={style.wsCardButton}
          disabled={isFull}
        />
      );
    }
  };

  return (
    <div className={style.workshopCatalogCard}>
      <div className={style.workshopContent}>
        <div className={style.titleBlock}>
          <Tags
            tagsList={[
              {
                label: isFull ? 'Full' : `${seatsRemaining} Seats Remaining`,
                icon: {
                  iconName: isFull ? 'users' : 'user-plus',
                  iconStyle: 'solid',
                  placement: 'left',
                },
              },
            ]}
            size="s"
            className={classNames(
              style.capacityTag,
              isFull ? style.fullCapacityTag : style.spotsOpenCapacityTag
            )}
          />
          <BodyOneText className={style.wsTitle}>
            {name ? name : `${course}: ${subject}`}
          </BodyOneText>
          <OverlineTwoText className={style.gradeNote}>
            FOR TEACHERS OF GRADES:
          </OverlineTwoText>
          <p>1, 2, 3, 4, 5</p>
        </div>
        <div className={style.infoBlock}>
          <span className={style.infoLine}>
            <div className={style.infoLineIconContainer}>
              <FontAwesomeV6Icon iconName={'calendar'} />
            </div>
            <BodyTwoText>{buildWorkshopStartText(sessions)}</BodyTwoText>
          </span>
          <span className={style.infoLine}>
            <div className={style.infoLineIconContainer}>
              <FontAwesomeV6Icon iconName={'screen-users'} />
            </div>
            <BodyTwoText>{`${format} workshop`}</BodyTwoText>
          </span>
          {locationName && (
            <span className={style.infoLine}>
              <div className={style.infoLineIconContainer}>
                <FontAwesomeV6Icon iconName={'building'} />
              </div>
              <BodyTwoText>{locationName}</BodyTwoText>
            </span>
          )}
          <span className={style.infoLine}>
            <div className={style.infoLineIconContainer}>
              <FontAwesomeV6Icon iconName={'dollar-circle'} />
            </div>
            <BodyTwoText>{fee ? fee : 'Free'}</BodyTwoText>
          </span>
          <span className={style.infoLine}>
            <div className={style.infoLineIconContainer}>
              <FontAwesomeV6Icon iconName={'arrow-up-wide-short'} />
            </div>
            <BodyTwoText>
              {hasPrereq ? 'Has prerequisites' : 'No prerequisites'}
            </BodyTwoText>
          </span>
        </div>
      </div>
      <div className={style.buttonContainer}>{RenderApplyOrEnrollButton()}</div>
    </div>
  );
};

RegionalWorkshopCatalogCard.propTypes = {
  id: PropTypes.number.isRequired,
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  name: PropTypes.string,
  capacity: PropTypes.number.isRequired,
  numEnrollments: PropTypes.number.isRequired,
  sessions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      is_local: PropTypes.bool.isRequired,
    })
  ).isRequired,
  format: PropTypes.string.isRequired,
  locationName: PropTypes.string,
  fee: PropTypes.string,
  hasPrereq: PropTypes.bool.isRequired,
  requiresApplication: PropTypes.bool.isRequired,
  customApplicationLink: PropTypes.string,
  customRegistrationLink: PropTypes.string,
};

export default RegionalWorkshopCatalogCard;
