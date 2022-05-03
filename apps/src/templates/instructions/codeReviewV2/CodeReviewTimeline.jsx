import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import CodeReviewTimelineCommit from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineCommit';
import CodeReviewTimelineReview from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineReview';
import {
  commitShape,
  reviewShape
} from '@cdo/apps/templates/instructions/codeReviewV2/shapes';

const dataType = {
  review: 'review',
  commit: 'commit'
};

const CodeReviewTimeline = ({reviewData, commitsData}) => {
  const labeledReviewData = reviewData.map(review => {
    review.type = dataType.review;
    return review;
  });
  const labeledCommitData = commitsData.map(commit => {
    commit.type = dataType.commit;
    return commit;
  });
  const mergedData = labeledReviewData.concat(labeledCommitData);
  mergedData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div style={styles.wrapper}>
      <CodeReviewTimelineElement
        type={codeReviewTimelineElementType.CREATED}
        isLast={mergedData.length === 0}
      />
      {mergedData.map((data, i) => {
        const lastElementInTimeline = i === mergedData.length - 1;
        if (data.type === dataType.commit) {
          return (
            <CodeReviewTimelineCommit
              key={`commit-${data.id}`}
              commit={data}
              isLastElementInTimeline={lastElementInTimeline}
            />
          );
        }

        if (data.type === dataType.review) {
          return (
            <CodeReviewTimelineReview
              key={`review-${data.id}`}
              review={data}
              isLastElementInTimeline={lastElementInTimeline}
            />
          );
        }
      })}
    </div>
  );
};

CodeReviewTimeline.propTypes = {
  reviewData: PropTypes.arrayOf(reviewShape),
  commitsData: PropTypes.arrayOf(commitShape)
};

export default CodeReviewTimeline;

const styles = {
  wrapper: {
    margin: '10px 0'
  }
};
