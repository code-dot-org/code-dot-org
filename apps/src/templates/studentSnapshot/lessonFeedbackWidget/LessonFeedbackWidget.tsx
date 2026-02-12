import Alert from '@code-dot-org/component-library/alert';
import React from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import {getAuthenticityToken} from '@cdo/apps/util/AuthenticityTokenStore';
import i18n from '@cdo/locale';

import ActionButtons from './ActionButtons';
import FeedbackTextbox from './FeedbackTextbox';
import RecommendedActions from './RecommendedActions';

import styles from './lessonFeeedback.module.scss';

interface LessonFeedbackWidgetProps {
  lessonId: number | null;
  teacherHasEnabledAi: boolean;
  studentId: number | null;
  unitId: number | null;
  sectionId: number | null;
}

interface LessonFeedbackData {
  id?: number;
  saved_feedback?: string;
  resources?: Array<{
    recommended_action?: string;
    resource_name?: string;
    resource_link?: string;
  }>;
}

const LessonFeedbackWidget: React.FC<LessonFeedbackWidgetProps> = ({
  lessonId,
  teacherHasEnabledAi = false,
  studentId,
  unitId,
  sectionId,
}) => {
  const [feedbackText, setFeedbackText] = React.useState<string>('');
  const [existingFeedbackData, setExistingFeedbackData] =
    React.useState<LessonFeedbackData | null>(null);
  const [resourceData, setResourceData] = React.useState<
    Array<{
      recommended_action: string;
      resource_name: string;
      resource_link: string;
    }>
  >([
    {
      recommended_action: '',
      resource_name: '',
      resource_link: '',
    },
  ]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Fetch lesson feedback from backend, and if not found, try generating ai feedback
  React.useEffect(() => {
    async function getAiLessonFeedback(
      lessonId: number,
      unitId: number,
      studentId: number,
      sectionId: number
    ) {
      try {
        const response = await fetch(
          `/student_snapshots/ai_generated_lesson_feedback?lesson_id=${lessonId}&unit_id=${unitId}&student_id=${studentId}&section_id=${sectionId}`
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch AI lesson feedback: ${response.status} ${response.statusText}`
          );
        }
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('AI lesson feedback error:', err);
        return null;
      }
    }

    async function fetchLessonFeedback() {
      if (!lessonId || !studentId || !unitId || !sectionId) {
        setFeedbackText('');
        setResourceData([
          {recommended_action: '', resource_name: '', resource_link: ''},
        ]);
        return;
      }
      setFeedbackText('');
      setResourceData([
        {recommended_action: '', resource_name: '', resource_link: ''},
      ]);
      try {
        const response = await fetch(
          `/lesson_feedbacks/saved_feedback?lesson_id=${lessonId}&student_id=${studentId}`
        );

        if (!response.ok) {
          // Try getting AI feedback from student work.
          const aiData = await getAiLessonFeedback(
            lessonId,
            unitId,
            studentId,
            sectionId
          );
          if (aiData && aiData.json) {
            const aiGeneratedInitialFeedback = JSON.parse(aiData.json).feedback;
            setFeedbackText(aiGeneratedInitialFeedback);
            setResourceData([
              {recommended_action: '', resource_name: '', resource_link: ''},
            ]);
          }
        } else {
          const data = await response.json();
          if (data.saved_feedback) {
            setFeedbackText(data.saved_feedback);
          }
          setExistingFeedbackData(data);
          if (data.resources && data.resources.length > 0) {
            setResourceData(data.resources);
          } else {
            setResourceData([
              {recommended_action: '', resource_name: '', resource_link: ''},
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setResourceData([
          {recommended_action: '', resource_name: '', resource_link: ''},
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    if (lessonId && studentId && unitId && sectionId) {
      setIsLoading(true);
      fetchLessonFeedback();
    }
  }, [lessonId, sectionId, studentId, unitId]);

  // Save as draft: update local state and persist to backend
  const handleSaveAsDraft = async () => {
    // Update local state
    setExistingFeedbackData((prev: LessonFeedbackData | null) => ({
      ...prev,
      saved_feedback: feedbackText,
      resources: resourceData,
    }));

    // Persist to backend
    if (!lessonId || !studentId) return;
    try {
      let response;
      if (existingFeedbackData && existingFeedbackData.id) {
        // Update existing feedback
        response = await fetch(`/lesson_feedbacks/${existingFeedbackData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
          body: JSON.stringify({
            saved_feedback: feedbackText,
            resources: resourceData,
          }),
        });
      } else {
        // Create new feedback
        response = await fetch('/lesson_feedbacks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
          body: JSON.stringify({
            lesson_id: lessonId,
            student_id: studentId,
            saved_feedback: feedbackText,
            resources: resourceData,
          }),
        });
      }
      if (!response.ok) {
        throw new Error('Failed to save draft feedback');
      }
      const data = await response.json();
      setExistingFeedbackData(data);
    } catch (err) {
      console.error('Error saving draft feedback:', err);
    }
  };

  // TO DO: Use Loading widget when needed here.
  const widgetContent = (
    <div className={styles.topContainer}>
      <Alert
        icon={{iconName: 'sparkles'}}
        text={i18n.lessonFeedbackAlertText()}
        type="aqua"
        size="xs"
        className={styles.alertBox}
      />
      <div className={styles.feedbackTextBoxWrapper}>
        <label className={styles.typographyLabelTwo}>{i18n.feedback()}</label>
        <FeedbackTextbox
          feedbackText={feedbackText}
          onFeedbackChange={setFeedbackText}
        />
      </div>
      <RecommendedActions
        resourceData={resourceData}
        setResourceData={setResourceData}
      />
      <ActionButtons
        onSaveAsDraft={handleSaveAsDraft}
        onSendToStudent={() => {
          console.log('Send to student:', feedbackText, resourceData);
        }}
      />
    </div>
  );

  return (
    <WidgetTemplate
      widgetName="Lesson Feedback"
      gridWidth={2}
      gridHeight={2}
      loading={isLoading}
      scrollable={true}
    >
      {widgetContent}
    </WidgetTemplate>
  );
};

export default LessonFeedbackWidget;
