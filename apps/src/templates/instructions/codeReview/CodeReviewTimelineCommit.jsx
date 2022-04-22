import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReview/CodeReviewTimelineElement';
import moment from 'moment';
import javalabMsg from '@cdo/javalab/locale';

const CodeReviewTimelineCommit = ({commit, isLastElementInTimeline}) => {
  const {createdAt, comment, projectVersion, isVersionExpired} = commit;
  const formattedDate = moment(createdAt).format('M/D/YYYY [at] h:mm A');

  return (
    <CodeReviewTimelineElement
      type={codeReviewTimelineElementType.COMMIT}
      isLast={isLastElementInTimeline}
      projectVersionId={projectVersion}
      isProjectVersionExpired={isVersionExpired}
    >
      <div style={styles.wrapper}>
        <div style={styles.header}>{javalabMsg.commit()}</div>
        <div style={styles.date}>{formattedDate}</div>
        <div>{comment}</div>
      </div>
    </CodeReviewTimelineElement>
  );
};

CodeReviewTimelineCommit.propTypes = {
  commit: PropTypes.shape({
    id: PropTypes.number.isRequired,
    createdAt: PropTypes.string.isRequired,
    comment: PropTypes.string.isRequired,
    projectVersion: PropTypes.string.isRequired,
    isVersionExpired: PropTypes.bool
  }),
  isLastElementInTimeline: PropTypes.bool
};

export default CodeReviewTimelineCommit;

const styles = {
  wrapper: {
    fontStyle: 'italic',
    marginBottom: '10px'
  },
  header: {
    fontFamily: '"Gotham 5r", sans-serif'
  },
  date: {
    fontSize: '12px',
    marginBottom: '10px',
    lineHeight: '12px'
  }
};
