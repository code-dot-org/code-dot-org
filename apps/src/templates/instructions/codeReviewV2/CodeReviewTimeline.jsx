import React, {useEffect, useRef} from 'react';
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
import {timelineDataType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';

const CodeReviewTimeline = props => {
  const {timelineData, addCodeReviewComment} = props;

  const timelineEndRef = useRef(null);

  const scrollToBottom = () => {
    timelineEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  return (
    <div style={styles.wrapper}>
      <CodeReviewTimelineElement
        type={codeReviewTimelineElementType.CREATED}
        isLast={timelineData.length === 0}
      />
      {timelineData.map((data, i) => {
        const lastElementInTimeline = i === timelineData.length - 1;
        if (data.type === timelineDataType.commit) {
          return (
            <CodeReviewTimelineCommit
              key={`commit-${data.id}`}
              commit={data}
              isLastElementInTimeline={lastElementInTimeline}
            />
          );
        }

        if (data.type === timelineDataType.review) {
          return (
            <CodeReviewTimelineReview
              key={`review-${data.id}`}
              review={data}
              isLastElementInTimeline={lastElementInTimeline}
              addCodeReviewComment={addCodeReviewComment}
            />
          );
        }
      })}
      <div ref={timelineEndRef} />
    </div>
  );
};

CodeReviewTimeline.propTypes = {
  timelineData: PropTypes.arrayOf(
    PropTypes.oneOfType(reviewShape, commitShape)
  ),
  addCodeReviewComment: PropTypes.func.isRequired
};

export default CodeReviewTimeline;

const styles = {
  wrapper: {
    margin: '10px 0'
  }
};
