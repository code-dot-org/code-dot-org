import {TextLink} from '@dsco_/link';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {queryParams} from '@cdo/apps/code-studio/utils';
import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import color from '@cdo/apps/util/color';
import {stringifyQueryParams} from '@cdo/apps/utils';
import javalabMsg from '@cdo/javalab/locale';

export const codeReviewTimelineElementType = {
  CREATED: 'created',
  COMMIT: 'commit',
  CODE_REVIEW: 'codeReview',
};

// This component represents elements on the code review and commit timeline. There are 3 types of elements:
// 1. CREATED - this is the node that represents the first element on the timeline, it has a line extending below
//    it unless it is also the only element in the timeline. Otherwise this node does not vary from project to project.
// 2. COMMIT - this represents a commit to the project. It will display an eyeball on the left which links to the
//    project version if the project version is present. It also handles a child which represents
//    the specific content in the commit. If it is the last element in the timeline, it will not have a line extending
//    down from it.
// 3. CODE_REVIEW - this represnts a code review request and comments made. It will display an eyeball to the left
//    which links to the project version if it is present. It takes a child which should be the actual
//    code review component. If it is the last element in the timeline it will not have a line extending below it.
const CodeReviewTimelineElement = ({
  type,
  isLast,
  projectVersionId,
  viewAsCodeReviewer,
  children,
}) => {
  const params = queryParams();
  params['version'] = projectVersionId;

  const versionLink =
    location.origin + location.pathname + stringifyQueryParams(params);

  // You can only see previous versions of your own project
  const displayEyeball = !viewAsCodeReviewer && !!projectVersionId;

  if (type === codeReviewTimelineElementType.CREATED) {
    return (
      <div style={styles.element}>
        <div style={styles.eyeColumn} />
        <div style={styles.timeline}>
          <TimelineDot color={color.purple} />
          {!isLast && <TimelineLine height="40px" marginRight="-1.5px" />}
        </div>
        <div style={{...styles.child, ...styles.createdText}}>
          {javalabMsg.created()}
        </div>
      </div>
    );
  }

  if (type === codeReviewTimelineElementType.COMMIT) {
    return (
      <div style={styles.element}>
        <div style={styles.eyeColumn}>
          {displayEyeball && <EyeballLink versionHref={versionLink} />}
        </div>
        <div style={styles.timeline}>
          <TimelineDot color={color.dark_charcoal} hasCheck={true} />
          {!isLast && <TimelineLine height={`calc(100% - ${dotHeight}px`} />}
        </div>
        <div style={{...styles.commitChild}}>{children}</div>
      </div>
    );
  }

  if (type === codeReviewTimelineElementType.CODE_REVIEW) {
    return (
      <div style={styles.element}>
        <div style={{...styles.eyeColumn, ...styles.reviewEye}}>
          {displayEyeball && <EyeballLink versionHref={versionLink} />}
        </div>
        <div style={styles.codeReviewTimeline}>
          <div>{children}</div>
          {!isLast && <TimelineLine height="40px" marginLeft="15px" />}
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
  children: PropTypes.node,
  viewAsCodeReviewer: PropTypes.bool,
};

// Helper to render the eyeball
const EyeballLink = ({versionHref}) => {
  return (
    <TextLink
      href={versionHref}
      icon={
        <FontAwesome icon={'eye'} title={'preview'} style={styles.eyeIcon} />
      }
      openInNewTab
    />
  );
};
EyeballLink.propTypes = {
  versionHref: PropTypes.string,
};

// Helper to render the dot
const TimelineDot = ({color, hasCheck}) => {
  return (
    <div style={{...styles.dot, background: color}}>
      {hasCheck && <FontAwesome icon="check" style={styles.check} />}
    </div>
  );
};
TimelineDot.propTypes = {
  color: PropTypes.string.isRequired,
  hasCheck: PropTypes.bool,
};

// Helper to render the lines
const TimelineLine = ({height, marginRight = '0px', marginLeft = '0px'}) => {
  const style = {
    borderLeft: lineStyle,
    height: height,
    marginRight: marginRight,
    marginLeft: marginLeft,
  };
  return <div style={style} />;
};
TimelineLine.propTypes = {
  height: PropTypes.string.isRequired,
  marginRight: PropTypes.string,
  marginLeft: PropTypes.string,
};

const lineStyle = `3px solid ${color.charcoal}`;
const dotHeight = 20;

const styles = {
  element: {
    display: 'flex',
  },
  eyeColumn: {
    width: '21px',
  },
  eyeIcon: {
    color: color.light_gray,
    fontSize: '20px',
  },
  reviewEye: {
    marginTop: '20px',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 10px 0 16px',
    alignItems: 'center',
  },
  codeReviewTimeline: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '11px',
    width: '100%',
  },
  dot: {
    width: dotHeight,
    height: dotHeight,
    borderRadius: '50%',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: color.white,
    paddingTop: '2px',
  },
  createdText: {
    ...fontConstants['main-font-semi-bold-italic'],
  },
  commitChild: {
    padding: '0 0 25px 20px',
    marginLeft: '-20px',
  },
};

export const UnconnectedCodeReviewTimelineElement = CodeReviewTimelineElement;

export default connect(state => ({
  viewAsCodeReviewer: state.pageConstants.isCodeReviewing,
}))(CodeReviewTimelineElement);
