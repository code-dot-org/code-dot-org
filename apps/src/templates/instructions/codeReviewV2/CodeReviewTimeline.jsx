import React, {useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType,
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import CodeReviewTimelineCommit from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineCommit';
import CodeReviewTimelineReview from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineReview';
import {
  commitShape,
  reviewShape,
} from '@cdo/apps/templates/instructions/codeReviewV2/shapes';
import {timelineElementType} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewDataApi';

// CodeReviewTimeline dynamically renders the timeline based on commit and code review data.
// It first renders a created node, then renders either commit or review timeline elements
// ordered by oldest at the top to most recent at the bottom. When the data has loaded, there
// is an automatic scroll to the bottom to orient the viewer to the latest changes.
const CodeReviewTimeline = props => {
  const {
    timelineData,
    addCodeReviewComment,
    closeReview,
    toggleResolveComment,
    deleteCodeReviewComment,
  } = props;

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
        if (data.timelineElementType === timelineElementType.commit) {
          return (
            <CodeReviewTimelineCommit
              key={`commit-${data.projectVersion}`}
              commit={data}
              isLastElementInTimeline={lastElementInTimeline}
            />
          );
        }

        if (data.timelineElementType === timelineElementType.review) {
          return (
            <CodeReviewTimelineReview
              key={`review-${data.id}`}
              review={data}
              isLastElementInTimeline={lastElementInTimeline}
              addCodeReviewComment={addCodeReviewComment}
              closeReview={closeReview}
              toggleResolveComment={toggleResolveComment}
              deleteCodeReviewComment={deleteCodeReviewComment}
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
    PropTypes.oneOfType([reviewShape, commitShape])
  ),
  addCodeReviewComment: PropTypes.func.isRequired,
  closeReview: PropTypes.func.isRequired,
  toggleResolveComment: PropTypes.func.isRequired,
  deleteCodeReviewComment: PropTypes.func.isRequired,
};

export default CodeReviewTimeline;

const styles = {
  wrapper: {
    margin: '10px 0',
  },
};
