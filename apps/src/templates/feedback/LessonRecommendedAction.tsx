import {Button} from '@code-dot-org/component-library/button';
import {
  BodyTwoText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import styles from './LessonFeedback.module.scss';

interface LessonRecommendedActionProps {
  resourceComment: string;
  resourceLink: string;
}

function LessonRecommendedAction({
  resourceComment,
  resourceLink,
}: LessonRecommendedActionProps) {
  const handleViewResource = () => {
    window.open(resourceLink, '_blank');
  };

  return (
    <div>
      <BodyTwoText className={styles.strongText}>
        Recommended action
      </BodyTwoText>
      <BodyThreeText>{resourceComment}</BodyThreeText>

      <Button
        onClick={handleViewResource}
        text="View Resource"
        type="primary"
        size="xs"
        iconLeft={{iconName: 'link'}}
      />
    </div>
  );
}

export default LessonRecommendedAction;
