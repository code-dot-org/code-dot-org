import {Button, LinkButton} from '@code-dot-org/component-library/button';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import Tags from '@code-dot-org/component-library/tags';
import {
  BodyOneText,
  BodyTwoText,
  OverlineTwoText,
} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useState} from 'react';

import {getSessionDate, getSessionTimes} from '../sessionDateUtils';

import GradeLevelsBarDisplay from './GradeLevelsBarDisplay';

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
  supportedGradeLevels,
  sessions,
  format,
  locationName,
  fee,
  hasPrereq,
  description,
  customRegistrationLink,
}) => {
  const [showLearnMoreDialog, setShowLearnMoreDialog] = useState(false);
  const seatsRemaining = capacity - numEnrollments;
  const isFull = seatsRemaining <= 0;
  const enrollButtonIconRight = customRegistrationLink
    ? {iconName: 'up-right-from-square'}
    : null;
  const enrollButtonHref = customRegistrationLink
    ? customRegistrationLink
    : `/pd/workshops/${id}/enroll`;

  return (
    <>
      {showLearnMoreDialog && (
        <Modal
          title={name ? name : `${course}: ${subject}`}
          description={description}
          primaryButtonProps={{
            ariaLabel: 'enrollNow',
            text: 'Enroll now',
            useAsLink: true,
            target: '_blank',
            iconRight: enrollButtonIconRight,
            href: enrollButtonHref,
            disabled: isFull,
          }}
          secondaryButtonProps={{
            ariaLabel: 'closeLearnMoreDialog',
            text: 'Return to workshops',
            onClick: () => setShowLearnMoreDialog(false),
          }}
        />
      )}
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
            {supportedGradeLevels?.length > 0 && (
              <div className={style.gradeContainer}>
                <OverlineTwoText className={style.gradeNote}>
                  FOR TEACHERS OF GRADES:
                </OverlineTwoText>
                <GradeLevelsBarDisplay
                  supportedGradeLevels={supportedGradeLevels}
                />
              </div>
            )}
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
        <div className={style.buttonContainer}>
          <Button
            aria-label="learnMore"
            text="Learn more"
            type="secondary"
            color="black"
            onClick={() => setShowLearnMoreDialog(true)}
            className={style.wsCardButton}
          />
          <LinkButton
            aria-label="enrollNow"
            text="Enroll now"
            target="_blank"
            color="purple"
            iconRight={enrollButtonIconRight}
            href={enrollButtonHref}
            className={style.wsCardButton}
            disabled={isFull}
          />
        </div>
      </div>
    </>
  );
};

RegionalWorkshopCatalogCard.propTypes = {
  id: PropTypes.number.isRequired,
  course: PropTypes.string.isRequired,
  subject: PropTypes.string,
  name: PropTypes.string,
  capacity: PropTypes.number.isRequired,
  numEnrollments: PropTypes.number.isRequired,
  supportedGradeLevels: PropTypes.arrayOf(PropTypes.string),
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
  description: PropTypes.string,
  customRegistrationLink: PropTypes.string,
};

export default RegionalWorkshopCatalogCard;
