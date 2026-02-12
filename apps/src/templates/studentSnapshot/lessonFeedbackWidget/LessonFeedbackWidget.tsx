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
  submitted_feedback?: string;
  submitted_at?: Date;
  resources?: Array<{
    recommended_action?: string;
    resource_name?: string;
    resource_link?: string;
  }>;
}

// Constants
const DEFAULT_RESOURCE = {
  recommended_action: '',
  resource_name: '',
  resource_link: '',
};

const DEFAULT_RESOURCES = [DEFAULT_RESOURCE];

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
  >(DEFAULT_RESOURCES);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);

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
        setResourceData([DEFAULT_RESOURCE]);
        return;
      }
      setFeedbackText('');
      setResourceData([DEFAULT_RESOURCE]);
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
            setResourceData([DEFAULT_RESOURCE]);
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
            setResourceData([DEFAULT_RESOURCE]);
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setResourceData([DEFAULT_RESOURCE]);
      } finally {
        setIsLoading(false);
      }
    }
    if (lessonId && studentId && unitId && sectionId) {
      setIsLoading(true);
      fetchLessonFeedback();
    }
  }, [lessonId, sectionId, studentId, unitId]);

  // Helper function to handle API requests
  const persistFeedbackToBackend = async (
    payload: LessonFeedbackData,
    feedbackId?: number
  ) => {
    if (!lessonId || !studentId) return null;

    try {
      let response;
      if (feedbackId) {
        setIsSaving(true);
        // Update existing feedback
        response = await fetch(`/lesson_feedbacks/${feedbackId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
          body: JSON.stringify(payload),
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
            ...payload,
          }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }
      setIsSaving(false);
      return await response.json();
    } catch (err) {
      console.error('Error saving feedback:', err);
      throw err;
    }
  };

  const handleSaveAsDraft = async () => {
    const newFeedbackData = {
      ...existingFeedbackData,
      saved_feedback: feedbackText,
      resources: resourceData,
    };

    setExistingFeedbackData(newFeedbackData);

    await persistFeedbackToBackend(
      {
        saved_feedback: feedbackText,
        resources: resourceData,
      },
      existingFeedbackData?.id
    );
  };

  const handleSendToStudent = async () => {
    // Create the new feedback data
    const newFeedbackData = {
      ...existingFeedbackData,
      saved_feedback: feedbackText,
      submitted_feedback: feedbackText,
      resources: resourceData,
      submitted_at: new Date(),
    };

    // Update local state
    setExistingFeedbackData(newFeedbackData);

    await persistFeedbackToBackend(
      {
        saved_feedback: feedbackText,
        resources: resourceData,
        submitted_feedback: feedbackText,
        submitted_at: new Date(),
      },
      existingFeedbackData?.id
    );
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
        onSendToStudent={handleSendToStudent}
        isSaving={isSaving}
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
