import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
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
      <Typography className={styles.strongText} variant="body2" gutterBottom>
        Recommended action
      </Typography>
      {resource.recommended_action && (
        <Typography variant="body3" gutterBottom>
          {resource.recommended_action}
        </Typography>
      )}
      {resource.resource_name && resource.resource_link && (
        <MuiButton
          variant="contained"
          color="primary"
          size="extraSmall"
          onClick={handleViewResource}
          type="button"
          startIcon={<FontAwesomeV6Icon iconName="link" />}
        >
          {resource.resource_name || 'View Resource'}
        </MuiButton>
      )}
    </div>
  );
}

export default LessonRecommendedAction;
