import React from 'react';
import PropTypes from 'prop-types';
import {TextLink} from '@dsco_/link';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

export const codeReviewTimelineElementType = {
  CREATED: 'created',
  COMMIT: 'commit',
  CODE_REVIEW: 'codeReview'
};

const CodeReviewTimelineElement = ({type, isLast, versionLink, children}) => {
  if (type === codeReviewTimelineElementType.CREATED) {
    return (
      <div style={styles.element}>
        <div style={styles.eye} />
        <div style={styles.timeline}>
          <TimelineDot color={color.purple} />
          {!isLast && <div style={styles.createdBottomLine} />}
        </div>
        <div style={{...styles.child, ...styles.createdText}}>Created</div>
      </div>
    );
  }

  if (type === codeReviewTimelineElementType.COMMIT) {
    const borderLeft = isLast ? 'none' : lineStyle;

    return (
      <div style={styles.element}>
        <div style={styles.eye}>
          <EyeballLink versionHref={versionLink} />
        </div>
        <div style={styles.timeline}>
          {isLast && <div style={styles.commitTopLine} />}
          <TimelineDot
            color={color.dark_charcoal}
            hasCheck={true}
            style={isLast ? {marginTop: 0} : {}}
          />
        </div>
        <div style={{...styles.commitChild, borderLeft}}>{children}</div>
      </div>
    );
  }

  if (type === codeReviewTimelineElementType.CODE_REVIEW) {
    return (
      <div style={styles.element}>
        <div style={styles.eye}>
          <EyeballLink versionHref={versionLink} />
        </div>
        <div style={styles.codeReviewTimeline}>
          <div style={styles.codeReviewTopLine} />
          <div>{children}</div>
          {!isLast && <div style={styles.codeReviewBottomLine} />}
        </div>
      </div>
    );
  }
};

CodeReviewTimelineElement.propTypes = {
  type: PropTypes.oneOf(Object.values(codeReviewTimelineElementType))
    .isRequired,
  isLast: PropTypes.bool,
  versionLink: PropTypes.string,
  children: PropTypes.node
};

const EyeballLink = ({versionHref}) => {
  return (
    <TextLink
      href={versionHref}
      icon={
        <FontAwesome icon={'eye'} title={'preview'} style={styles.eyeIcon} />
      }
    />
  );
};
EyeballLink.propTypes = {
  versionHref: PropTypes.string
};

const TimelineDot = ({color, hasCheck, style = {}}) => {
  return (
    <div style={{...styles.dot, background: color, ...style}}>
      {hasCheck && <FontAwesome icon="check" style={styles.check} />}
    </div>
  );
};
TimelineDot.propTypes = {
  color: PropTypes.string.isRequired,
  hasCheck: PropTypes.bool,
  style: PropTypes.object
};

const lineStyle = `3px solid ${color.charcoal}`;

const styles = {
  element: {
    display: 'flex'
  },
  eye: {
    paddingTop: '10px',
    width: '21px'
  },
  eyeIcon: {
    color: color.light_gray,
    fontSize: '20px'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 10px 0 16px',
    alignItems: 'center'
  },
  codeReviewTimeline: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '11px'
  },
  createdBottomLine: {
    borderLeft: lineStyle,
    height: '20px',
    marginRight: '-1.5px'
  },
  commitTopLine: {
    borderLeft: lineStyle,
    height: '10px',
    marginRight: '-1.5px'
  },
  codeReviewTopLine: {
    borderLeft: lineStyle,
    height: '10px',
    marginLeft: '15px'
  },
  codeReviewBottomLine: {
    borderLeft: lineStyle,
    height: '30px',
    marginLeft: '15px'
  },
  dot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    margin: '1px 0',
    zIndex: 1,
    marginTop: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  check: {
    color: color.white,
    paddingTop: '2px'
  },
  createdText: {
    fontWeight: 'bold'
  },
  commitChild: {
    padding: '10px 0 10px 20px',
    marginLeft: '-20px'
  },
  child: {
    paddingTop: '10px'
  }
};

export default CodeReviewTimelineElement;
