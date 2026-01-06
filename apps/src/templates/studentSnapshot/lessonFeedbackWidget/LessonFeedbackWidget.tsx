import Alert from '@code-dot-org/component-library/alert';
import {
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import i18n from '@cdo/locale';

import FeedbackTextbox from './FeedbackTextbox';

import styles from './lessonFeeedback.module.scss';

interface LessonFeedbackWidgetProps {
  gridWidth?: number;
  gridHeight?: number;
  lessonId: number | null;
  studentId: number;
  teacherHasEnabledAi: boolean;
}

/**
 * Teacher-style lesson feedback widget for the Student Snapshot dashboard.
 *
 * The widget handles its own data fetching, loading, and error states.
 */

const LessonFeedbackWidget: React.FC<LessonFeedbackWidgetProps> = ({
  gridWidth = 2,
  gridHeight = 2,
  lessonId,
  studentId,
  teacherHasEnabledAi = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  let widgetContent: React.ReactNode;
  let scrollable = false;

  // TODO: Load feedback data from server when API is available - building off Liam's Lesson Insight work

  useEffect(() => {
    if (!lessonId) {
      setIsLoading(true);
      setError(null);
      return;
    } else if (!teacherHasEnabledAi) {
      setError('AI Teaching Assistant is not enabled for this teacher.');
      setIsLoading(false);
      return;
    } else {
      setIsLoading(false);
      setError(null);
    }
  }, [lessonId, teacherHasEnabledAi]);

  // TODO: Finish UI implementation
  if (error) {
    widgetContent = <BodyThreeText>{error}</BodyThreeText>;
  } else {
    scrollable = true;
    widgetContent = (
      <div className={styles.topContainer}>
        <Alert
          icon={{iconName: 'sparkles'}}
          onClick={() => console.log('Alert clicked')}
          text={i18n.lessonFeedbackAlertText()}
          type="aqua"
        />
        <label className={styles.typographyLabelTwo}>{i18n.feedback()}</label>
        <FeedbackTextbox
          feedbackText="PLACEHOLDER - This is where the feedback text will go."
          onFeedbackChange={newText => {
            console.log('Feedback changed:', newText);
          }}
        />
        <label className={styles.typographyLabelTwo}>
          {i18n.lessonFeedbackRecommendedAction()}
        </label>
        <BodyFourText noMargin>
          {i18n.lessonFeedbackRecommendedActionDirections()}
        </BodyFourText>
      </div>
    );
  }

  return (
    <WidgetTemplate
      widgetName="Lesson Feedback"
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      loading={isLoading}
      scrollable={scrollable}
    >
      {widgetContent}
    </WidgetTemplate>
  );
};

export default LessonFeedbackWidget;
