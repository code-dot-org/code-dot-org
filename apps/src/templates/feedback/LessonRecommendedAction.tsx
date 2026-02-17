import {Button} from '@code-dot-org/component-library/button';
import {
  BodyTwoText,
  BodyThreeText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import styles from './LessonFeedback.module.scss';

interface LessonRecommendedActionProps {
  resource: {
    recommended_action?: string;
    resource_name?: string;
    resource_link?: string;
  };
}

function LessonRecommendedAction({resource}: LessonRecommendedActionProps) {
  const handleViewResource = () => {
    if (resource.resource_link) {
      const url = resource.resource_link.match(/^https?:\/\//)
        ? resource.resource_link
        : `https://${resource.resource_link}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div>
      <BodyTwoText className={styles.strongText}>
        Recommended action
      </BodyTwoText>
      {resource.recommended_action && (
        <BodyThreeText>{resource.recommended_action}</BodyThreeText>
      )}
      {resource.resource_name && resource.resource_link && (
        <Button
          onClick={handleViewResource}
          text={resource.resource_name || 'View Resource'}
          type="primary"
          size="xs"
          iconLeft={{iconName: 'link'}}
        />
      )}
    </div>
  );
}

export default LessonRecommendedAction;
