import React from 'react';
import PropTypes from 'prop-types';
import {TextLink} from '@dsco_/link';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import javalabMsg from '@cdo/javalab/locale';

export const codeReviewTimelineElementType = {
  CREATED: 'created',
  COMMIT: 'commit',
  CODE_REVIEW: 'codeReview'
};

// This component represents elements on the code review and commit timeline. There are 3 types of elements:
// 1. CREATED - this is the node that represents the first element on the timeline, if it is the last element
//    in the timeline it will not have a line below it. Otherwise this node does not vary from project to project.
// 2. COMMIT - this represents a commit to the project. It will display an eyeball on the left which links to the
//    project version if the project version is present and not expired. It also handles a child which represents
//    the specific content in the commit. If it is the last element in the timeline, it will not have a line extending
//    down from it.
// 3. CODE_REVIEW - this represnts a code review request and comments made. It will display an eyeball to the left
//    which links to the project version if it is present and not expired. It takes a child which should be the actual
//    code review component. If it is the last element in the timeline it will not have a line extending below it.
const CodeReviewTimelineElement = ({
  type,
  isLast,
  projectVersionId,
  isProjectVersionExpired,
  children
}) => {
  const displayVersion = !isProjectVersionExpired && !!projectVersionId;
  const versionLink =
    location.origin + location.pathname + '?version=' + projectVersionId;

  if (type === codeReviewTimelineElementType.CREATED) {
    return (
      <div style={styles.element}>
        <div style={styles.eye} />
        <div style={styles.timeline}>
          <TimelineDot color={color.purple} />
          {!isLast && <TimelineLine height={20} marginRight={-1.5} />}
        </div>
        <div style={{...styles.child, ...styles.createdText}}>
          {javalabMsg.created()}
        </div>
      </div>
    );
  }

  if (type === codeReviewTimelineElementType.COMMIT) {
    const borderLeft = isLast ? 'none' : lineStyle;

    return (
      <div style={styles.element}>
        <div style={styles.eye}>
          {displayVersion && <EyeballLink versionHref={versionLink} />}
        </div>
        <div style={styles.timeline}>
          {isLast && <TimelineLine height={10} marginRight={-1.5} />}
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
          {displayVersion && <EyeballLink versionHref={versionLink} />}
        </div>
        <div style={styles.codeReviewTimeline}>
          <TimelineLine height={10} marginLeft={15} />
          <div>{children}</div>
          {!isLast && <TimelineLine height={30} marginLeft={15} />}
        </div>
      </div>
    );
  }
};

CodeReviewTimelineElement.propTypes = {
  type: PropTypes.oneOf(Object.values(codeReviewTimelineElementType))
    .isRequired,
  isLast: PropTypes.bool,
  projectVersionId: PropTypes.string,
  isProjectVersionExpired: PropTypes.bool,
  children: PropTypes.node
};

// Helper to render the eyeball
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

// Helper to render the dot
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

// Helper to render the lines
const TimelineLine = ({height = 10, marginRight = 0, marginLeft = 0}) => {
  const style = {
    borderLeft: lineStyle,
    height: `${height}px`,
    marginRight: `${marginRight}px`,
    marginLeft: `${marginLeft}px`
  };
  return <div style={style} />;
};
TimelineLine.propTypes = {
  height: PropTypes.number,
  marginRight: PropTypes.number,
  marginLeft: PropTypes.number
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
    fontFamily: '"Gotham 5r", sans-serif',
    fontStyle: 'italic'
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
