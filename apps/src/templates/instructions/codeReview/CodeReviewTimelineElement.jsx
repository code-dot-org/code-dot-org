import React from 'react';
import PropTypes from 'prop-types';
import {TextLink} from '@dsco_/link';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

export const codeReviewTimelineElementType = {
  CREATED: 'created',
  COMMIT: 'commit',
  CODE_REVIEW: 'codeReview'
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

const CodeReviewTimelineElement = ({type, isLast, versionLink, children}) => {
  if (type === codeReviewTimelineElementType.CREATED) {
    return (
      <div style={styles.element}>
        <div style={{...styles.eye, width: '21px'}} />
        <div style={{...styles.timeline, alignItems: 'center'}}>
          <div style={{...styles.dot, background: 'purple'}} />
          <div style={styles.line} />
        </div>
        <div style={styles.child}>Created</div>
      </div>
    );
  } else if (type === codeReviewTimelineElementType.COMMIT) {
    return (
      <div style={styles.element}>
        <div style={styles.eye}>
          <EyeballLink versionHref={versionLink} />
        </div>
        <div style={styles.timeline}>
          <div style={{...styles.dot, background: 'gray'}} />
        </div>
        <div style={styles.commitChild}>{children}</div>
      </div>
    );
  } else if (type === codeReviewTimelineElementType.CODE_REVIEW) {
    return (
      <div style={styles.element}>
        <div style={{...styles.eye, width: '28px'}}>
          <EyeballLink versionHref={versionLink} />
        </div>
        <div style={styles.timeline}>
          <div style={styles.topLine} />
          <div style={styles.child}>{children}</div>
          {!isLast && <div style={styles.line} />}
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

const styles = {
  element: {
    display: 'flex'
  },
  eye: {
    paddingTop: '10px'
  },
  eyeIcon: {
    color: 'gray',
    fontSize: '20px'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 10px'
  },
  line: {
    borderLeft: '2px solid black',
    height: '30px',
    margin: '0 2px'
  },
  topLine: {
    borderLeft: '2px solid black',
    height: '10px',
    margin: '0 2px'
  },
  dot: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    margin: '1px 0',
    zIndex: 1,
    marginTop: '10px'
  },
  commitChild: {
    borderLeft: '2px solid black',
    padding: '10px 0 10px 20px',
    marginLeft: '-20px'
  },
  child: {
    paddingTop: '10px'
  }
};

export default CodeReviewTimelineElement;
