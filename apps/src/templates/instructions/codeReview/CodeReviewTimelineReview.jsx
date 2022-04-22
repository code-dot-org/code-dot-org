import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReview/CodeReviewTimelineElement';

const CodeReviewTimelineReview = ({isLastElementInTimeline}) => {
  return (
    <CodeReviewTimelineElement
      type={codeReviewTimelineElementType.CODE_REVIEW}
      isLast={isLastElementInTimeline}
    >
      <div style={{backgroundColor: 'white', height: '40px'}}>
        Code review placeholder
      </div>
    </CodeReviewTimelineElement>
  );
};

CodeReviewTimelineReview.propTypes = {
  isLastElementInTimeline: PropTypes.bool
};

export default CodeReviewTimelineReview;
