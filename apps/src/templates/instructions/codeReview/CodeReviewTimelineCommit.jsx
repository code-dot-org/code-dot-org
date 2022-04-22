import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReview/CodeReviewTimelineElement';

const CodeReviewTimelineCommit = ({isLastElementInTimeline}) => {
  return (
    <CodeReviewTimelineElement
      type={codeReviewTimelineElementType.COMMIT}
      isLast={isLastElementInTimeline}
    >
      <div style={styles.wrapper}>
        <div style={styles.header}>Commit</div>
        <div style={styles.date}>Date</div>
        <div>First implmentation of spray painter class</div>
      </div>
    </CodeReviewTimelineElement>
  );
};

CodeReviewTimelineCommit.propTypes = {
  isLastElementInTimeline: PropTypes.bool
};

export default CodeReviewTimelineCommit;

const styles = {
  wrapper: {
    fontStyle: 'italic',
    marginBottom: '10px'
  },
  header: {
    fontWeight: 'bold'
  },
  date: {
    fontSize: '12px',
    marginBottom: '10px'
  }
};
