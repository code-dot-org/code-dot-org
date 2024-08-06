import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import fontConstants from '@cdo/apps/fontConstants';
import Button from '@cdo/apps/legacySharedComponents/Button';
import firehoseClient from '@cdo/apps/metrics/utils/firehose';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

import trackEvent from '../metrics/trackEvent';

export const NotificationType = {
  default: 'default',
  information: 'information',
  success: 'success',
  failure: 'failure',
  warning: 'warning',
  course: 'course',
  bullhorn: 'bullhorn',
  feedback: 'feedback',
  bullhorn_yellow: 'bullhorn_yellow',
  collaborate: 'collaborate',
};

const Notification = ({
  buttonClassName,
  buttonLink,
  buttons,
  buttonsStyles,
  buttonText,
  buttonColor,
  children,
  details,
  detailsLink,
  detailsLinkNewWindow,
  detailsLinkText,
  dismissible,
  firehoseAnalyticsData,
  googleAnalyticsId,
  iconStyles,
  isRtl,
  newWindow,
  notice,
  onDismiss,
  onButtonClick,
  responsiveSize,
  type,
  tooltipText,
  width,
  colors,
}) => {
  const [open, setOpen] = useState(true);

  const handleDismiss = () => {
    setOpen(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const logAnnouncementClickToFirehose = () => {
    let record = {};

    // Our firehose logging system has standalone fields for commonly used metadata (eg, user_id).
    // Here, we separate out those fields from any other analytics data provided in the firehoseAnalyticsData prop.
    // We include these properties in the data_json object as well, in case that is easier for our product team to use.
    ['user_id', 'script_id', 'lesson_id'].forEach(firehoseMetadataKey => {
      if (firehoseMetadataKey in firehoseAnalyticsData) {
        record[firehoseMetadataKey] =
          firehoseAnalyticsData[firehoseMetadataKey];
      }
    });

    record = {
      ...record,
      study: 'notification_engagement',
      event: 'notification_click',
      data_json: JSON.stringify({
        ...firehoseAnalyticsData,
        notice: notice,
        details: details,
        buttonLink: buttonLink,
      }),
    };

    firehoseClient.putRecord(record, {includeUserId: true});
  };

  const onAnnouncementClick = () => {
    // Log to Google Analytics
    if (googleAnalyticsId) {
      trackEvent('teacher_announcement', 'click', googleAnalyticsId);
    }

    // Log to Firehose
    if (firehoseAnalyticsData) {
      logAnnouncementClickToFirehose();
    }

    if (onButtonClick) {
      onButtonClick();
    }
  };

  const desktop = responsiveSize === undefined || responsiveSize === 'lg';

  const icons = {
    information: 'info-circle',
    success: 'check-circle',
    failure: 'exclamation-triangle',
    warning: 'exclamation-triangle',
    bullhorn: 'bullhorn',
    bullhorn_yellow: 'bullhorn',
    feedback: 'envelope',
    collaborate: 'users',
  };

  const mainStyle = {
    ...styles.main,
    direction: isRtl ? 'rtl' : 'ltr',
    width: width || styles.main.width,
  };

  if (!open) {
    return null;
  }

  const colorStyles = {...styles.colors[type], ...colors};

  const tooltipId = _.uniqueId();

  return (
    <div className="announcement-notification">
      <div style={{...colorStyles, ...mainStyle}}>
        {type !== NotificationType.course && (
          <div style={{...styles.iconBox, ...colorStyles, ...iconStyles}}>
            {icons[type] && (
              <FontAwesome icon={icons[type]} style={styles.icon} />
            )}
          </div>
        )}
        <div style={styles.contentBox}>
          <div style={styles.wordBox}>
            <div style={{...colorStyles, ...styles.notice}}>
              {notice}
              {tooltipText ? (
                <span>
                  <span data-tip data-for={tooltipId} style={styles.tooltip}>
                    <FontAwesome icon="info-circle" />
                  </span>
                  <ReactTooltip id={tooltipId} effect="solid">
                    <p style={styles.tooltipText}>{tooltipText}</p>
                  </ReactTooltip>
                </span>
              ) : null}
            </div>
            <div style={styles.details}>
              {details}
              {detailsLinkText && detailsLink && (
                <span>
                  &nbsp;
                  <a
                    href={detailsLink}
                    style={styles.detailsLink}
                    target={detailsLinkNewWindow ? '_blank' : null}
                    rel={detailsLinkNewWindow ? 'noreferrer' : undefined}
                  >
                    {detailsLinkText}
                  </a>
                </span>
              )}
            </div>
          </div>
          <div
            style={
              desktop ? buttonsStyles : {...styles.buttonsMobile, buttonsStyles}
            }
          >
            {buttonText && buttonLink && (
              <Button
                __useDeprecatedTag
                href={buttonLink}
                color={buttonColor || Button.ButtonColor.gray}
                text={buttonText}
                style={styles.button}
                target={newWindow ? '_blank' : null}
                onClick={onAnnouncementClick}
                className={buttonClassName}
              />
            )}
            {buttons &&
              buttons.map((button, index) => (
                <Button
                  key={index}
                  href={button.link}
                  color={button.color || Button.ButtonColor.gray}
                  text={button.text}
                  style={{...styles.button, ...button.style}}
                  onClick={button.onClick}
                  className={button.className}
                />
              ))}
            {children}
          </div>
        </div>
        {dismissible && (
          <div style={styles.dismiss}>
            <FontAwesome icon="times" onClick={handleDismiss} />
          </div>
        )}
      </div>
      <div style={styles.clear} />
    </div>
  );
};

Notification.propTypes = {
  type: PropTypes.oneOf(Object.keys(NotificationType)).isRequired,
  notice: PropTypes.string.isRequired,
  details: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  detailsLinkText: PropTypes.string,
  detailsLink: PropTypes.string,
  detailsLinkNewWindow: PropTypes.bool,
  buttonText: PropTypes.string,
  buttonLink: PropTypes.string,
  buttonColor: PropTypes.string,
  dismissible: PropTypes.bool.isRequired,
  iconStyles: PropTypes.object,
  onDismiss: PropTypes.func,
  newWindow: PropTypes.bool,
  // googleAnalyticsId and firehoseAnalyticsData are only used when a primary button is provided.
  // It's not used by the array of buttons.
  googleAnalyticsId: PropTypes.string,
  firehoseAnalyticsData: PropTypes.object,
  responsiveSize: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']),
  isRtl: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func,
  buttonClassName: PropTypes.string,

  // Optionally can provide a tooltip after the title with text on hover.
  tooltipText: PropTypes.string,

  // Optionally can provide an array of buttons.
  buttonsStyles: PropTypes.object,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      link: PropTypes.string,
      onClick: PropTypes.func,
      className: PropTypes.string,
      color: PropTypes.oneOf(Object.keys(Button.ButtonColor)),
      style: PropTypes.object,
    })
  ),

  // Optionally can provide children, such as one or more buttons.
  children: PropTypes.node,

  // Can be specified to override default width
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  colors: PropTypes.shape({
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    color: PropTypes.string,
  }),
};

Notification.defaultProps = {
  type: NotificationType.default,
  colors: {},
};

const styles = {
  main: {
    borderWidth: 1,
    borderStyle: 'solid',
    minHeight: 72,
    width: '100%',
    backgroundColor: color.white,
    marginBottom: 20,
    display: 'flex',
    flexFlow: 'wrap',
    boxSizing: 'border-box',
  },
  notice: {
    ...fontConstants['main-font-regular'],
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 1.5,
    marginTop: 16,
    backgroundColor: color.white,
  },
  details: {
    ...fontConstants['main-font-regular'],
    fontSize: 14,
    lineHeight: 1.5,
    paddingTop: 6,
    paddingBottom: 16,
    color: color.charcoal,
  },
  detailsLink: {
    ...fontConstants['main-font-semi-bold'],
    color: color.teal,
  },
  wordBox: {
    // flex priority
    flex: 1,
    marginLeft: 25,
    marginRight: 25,
  },
  dismiss: {
    color: color.lighter_gray,
    marginTop: 5,
    marginRight: 0,
    marginLeft: 10,
    cursor: 'pointer',
  },
  iconBox: {
    width: 72,
    backgroundColor: color.lightest_gray,
    textAlign: 'center',
    float: 'left',
  },
  contentBox: {
    // The subtracted 100px leaves room for both the icon column on the left and
    // the dismiss X icon column on the right.
    width: 'calc(100% - 100px)',
    display: 'flex',
    flexFlow: 'wrap',
  },
  icon: {
    color: 'rgba(255,255,255, .8)',
    fontSize: 38,
    lineHeight: 2,
  },
  buttonsMobile: {
    width: '100%',
  },
  button: {
    marginLeft: 25,
    marginRight: 25,
    marginTop: 18,
    marginBottom: 18,
  },
  colors: {
    [NotificationType.default]: {
      borderColor: color.teal,
      backgroundColor: color.teal,
    },
    [NotificationType.information]: {
      borderColor: color.teal,
      color: color.teal,
      backgroundColor: color.teal,
    },
    [NotificationType.success]: {
      borderColor: color.level_perfect,
      color: color.level_perfect,
      backgroundColor: color.level_perfect,
    },
    [NotificationType.failure]: {
      borderColor: color.red,
      color: color.red,
      backgroundColor: color.red,
    },
    [NotificationType.warning]: {
      borderColor: color.mustardyellow,
      color: color.charcoal,
      backgroundColor: color.mustardyellow,
    },
    [NotificationType.course]: {
      borderColor: color.border_gray,
      color: color.teal,
      backgroundColor: color.teal,
    },
    [NotificationType.bullhorn]: {
      borderColor: color.teal,
      color: color.teal,
      backgroundColor: color.teal,
    },
    [NotificationType.bullhorn_yellow]: {
      borderColor: color.yellow,
      color: color.yellow,
      backgroundColor: color.yellow,
    },
    [NotificationType.feedback]: {
      borderColor: color.purple,
      color: color.purple,
      backgroundColor: color.purple,
    },
    [NotificationType.collaborate]: {
      borderColor: color.light_secondary_500,
      color: color.light_secondary_500,
      backgroundColor: color.light_secondary_500,
    },
  },
  clear: {
    clear: 'both',
  },
  tooltip: {
    cursor: 'pointer',
    marginLeft: '5px',
    marginRight: '5px',
    fontSize: '14px',
    verticalAlign: 'middle',
    color: color.light_gray_500,
  },
  tooltipText: {
    color: color.white,
    margin: 0,
  },
};

export default connect(state => ({
  isRtl: state.isRtl,
}))(Notification);

export const NotificationResponsive = connect(state => ({
  isRtl: state.isRtl,
  responsiveSize: state.responsive.responsiveSize,
}))(Notification);
