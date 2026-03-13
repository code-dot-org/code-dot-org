import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tags from '@code-dot-org/component-library/tags';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Typography, Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {Fragment} from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {navigateToHref} from '@cdo/apps/utils';

import {getSessionDate, getSessionTimes} from '../sessionDateUtils';

import GradeLevelsBarDisplay from './GradeLevelsBarDisplay';

import style from './regionalWorkshopCatalog.module.scss';

const buildSessionDateAndTime = session => {
  const firstSessionDate = getSessionDate({
    session: session,
    format: 'MM/DD/YY',
    isLocal: session.is_local,
  });
  const {startTime, endTime} = getSessionTimes({
    session: session,
    format: 'h:mmA',
    isLocal: session.is_local,
  });
  return `${firstSessionDate} (${startTime}-${endTime})`;
};

const buildWorkshopStartText = sessions => {
  const firstSessionDateTime = buildSessionDateAndTime(sessions[0]);
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
}) => {
  const seatsRemaining = capacity - numEnrollments;
  const isFull = seatsRemaining <= 0;

  const handleClickLearnMore = () => {
    analyticsReporter.sendEvent(
      EVENTS.REGIONAL_WS_CATALOG_LEARN_MORE_CLICK_EVENT,
      {
        workshop_id: id,
        workshop_course: course,
        workshop_subject: subject,
        workshop_format: format,
      }
    );
    navigateToHref(`/professional-learning/workshops/${id}`);
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
          <Typography className={style.wsTitle} variant="body1" gutterBottom>
            {name ? name : `${course}: ${subject}`}
          </Typography>
          {supportedGradeLevels?.length > 0 && (
            <div className={style.gradeContainer}>
              <Typography
                className={style.gradeNote}
                variant="overline2"
                gutterBottom
              >
                FOR TEACHERS OF GRADES:
              </Typography>
              <GradeLevelsBarDisplay
                supportedGradeLevels={supportedGradeLevels}
              />
            </div>
          )}
        </div>
        <div className={style.infoBlock}>
          <WithTooltip
            tooltipProps={{
              tooltipId: sessions[0].start,
              size: 'xs',
              text: sessions.map(session => {
                const text = buildSessionDateAndTime(session);
                return (
                  <Fragment key={text}>
                    {text}
                    <br />
                  </Fragment>
                );
              }),
            }}
          >
            <span className={style.infoLine}>
              <div className={style.infoLineIconContainer}>
                <FontAwesomeV6Icon iconName={'calendar'} />
              </div>
              <Typography variant="body2" gutterBottom>
                {buildWorkshopStartText(sessions)}
              </Typography>
            </span>
          </WithTooltip>
          <span className={style.infoLine}>
            <div className={style.infoLineIconContainer}>
              <FontAwesomeV6Icon iconName={'screen-users'} />
            </div>
            <Typography
              variant="body2"
              gutterBottom
            >{`${format} workshop`}</Typography>
          </span>
          {locationName && (
            <span className={style.infoLine}>
              <div className={style.infoLineIconContainer}>
                <FontAwesomeV6Icon iconName={'building'} />
              </div>
              <Typography variant="body2" gutterBottom>
                {locationName}
              </Typography>
            </span>
          )}
          <span className={style.infoLine}>
            <div className={style.infoLineIconContainer}>
              <FontAwesomeV6Icon iconName={'dollar-circle'} />
            </div>
            <Typography variant="body2" gutterBottom>
              {fee ? fee : 'Free'}
            </Typography>
          </span>
          <span className={style.infoLine}>
            <div className={style.infoLineIconContainer}>
              <FontAwesomeV6Icon iconName={'arrow-up-wide-short'} />
            </div>
            <Typography variant="body2" gutterBottom>
              {hasPrereq ? 'Has prerequisites' : 'No prerequisites'}
            </Typography>
          </span>
        </div>
      </div>
      <div className={style.buttonContainer}>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          disabled={isFull}
          className={style.wsCardButton}
          onClick={() => handleClickLearnMore()}
          aria-label="learnMore"
          type="button"
        >
          {'Learn more'}
        </MuiButton>
      </div>
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
};

export default RegionalWorkshopCatalogCard;
