import React from 'react';
import PropTypes from 'prop-types';
import CodeReviewTimelineElement, {
  codeReviewTimelineElementType
} from '@cdo/apps/templates/instructions/codeReviewV2/CodeReviewTimelineElement';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Button from '@cdo/apps/templates/Button';

const CodeReviewTimelineReview = ({isLastElementInTimeline}) => {
  return (
    <CodeReviewTimelineElement
      type={codeReviewTimelineElementType.CODE_REVIEW}
      isLast={isLastElementInTimeline}
    >
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div style={styles.icon}>
            <FontAwesome icon="user" />
          </div>
          <div style={styles.title}>
            <div>Code Review</div>
            <div>opened date</div>
          </div>
          <div>
            <Button
              onClick={() => {}}
              text={'Close review'}
              color={Button.ButtonColor.blue}
            />
          </div>
        </div>
      </div>
    </CodeReviewTimelineElement>
  );
};

CodeReviewTimelineReview.propTypes = {
  isLastElementInTimeline: PropTypes.bool
};

export default CodeReviewTimelineReview;

const styles = {
  wrapper: {
    backgroundColor: 'white',
    height: '40px',
    borderRadius: '10px',
    padding: '20px'
  },
  icon: {
    paddingRight: '5px'
  },
  header: {
    display: 'flex'
  },
  title: {
    flexGrow: 1
  }
};
