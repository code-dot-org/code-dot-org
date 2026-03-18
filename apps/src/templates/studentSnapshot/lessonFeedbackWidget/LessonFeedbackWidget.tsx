import Alert from '@code-dot-org/component-library/alert';
import React from 'react';

import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
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
  submitted_at?: Date | string;
  resources?: Array<{
    recommended_action?: string;
    resource_name?: string;
    resource_link?: string;
  }>;
  created_at?: Date | string;
  updated_at?: Date | string;
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
  const [savedOrSubmittedTimestamp, setSavedOrSubmittedTimestamp] =
    React.useState<Date | null>(null);

  const determineTimeStamp = (feedbackData: LessonFeedbackData) => {
    if (feedbackData.submitted_at) {
      return new Date(feedbackData.submitted_at);
    } else if (feedbackData.updated_at) {
      return new Date(feedbackData.updated_at);
    }
    return null;
  };

  // Fetch lesson feedback from backend, and if not found, try generating ai feedback
  React.useEffect(() => {
    async function getAiLessonFeedback(
      lessonId: number,
      unitId: number,
      studentId: number,
      sectionId: number
    ) {
      // First check if the student has made any progress on the lesson
      try {
        const workResponse = await fetch(
          `/student_snapshots/student_has_work_in_lesson?lesson_id=${lessonId}&unit_id=${unitId}&student_id=${studentId}`
        );

        if (!workResponse.ok) {
          console.log('No student work found');
          return null;
        }

        const workData = await workResponse.json();
        if (!workData.has_work) {
          // Return a special object to indicate no work, but don't fetch AI feedback
          return {hasWork: false};
        }
      } catch (error) {
        console.error('Error checking for student work:', error);
        console.log('No student work found');
        return null;
      }

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
        setExistingFeedbackData(null);
        setSavedOrSubmittedTimestamp(null);
        return;
      }

      // Clear all previous lesson feedback data when switching lessons
      setFeedbackText('');
      setResourceData([DEFAULT_RESOURCE]);
      setExistingFeedbackData(null);
      setSavedOrSubmittedTimestamp(null);

      try {
        const response = await fetch(
          `/lesson_feedbacks/saved_feedback?lesson_id=${lessonId}&student_id=${studentId}`
        );

        if (!response.ok) {
          // No existing feedback found for this lesson - try getting AI feedback from student work.
          const aiData = await getAiLessonFeedback(
            lessonId,
            unitId,
            studentId,
            sectionId
          );
          if (aiData && aiData.hasWork === false) {
            // Student has no work, set default message but allow feedback creation
            // Keep existingFeedbackData as null so we create new record
            setFeedbackText(
              "The student has not made any progress on this lesson yet, so we don't have any feedback to share. Check back after the student has worked on the lesson!"
            );
            setResourceData([DEFAULT_RESOURCE]);
          } else if (aiData && aiData.record) {
            const aiGeneratedInitialFeedbackRecord = aiData.record;
            setExistingFeedbackData(aiGeneratedInitialFeedbackRecord);
            setFeedbackText(aiGeneratedInitialFeedbackRecord.saved_feedback);
            setResourceData([DEFAULT_RESOURCE]);
            setSavedOrSubmittedTimestamp(
              determineTimeStamp(aiGeneratedInitialFeedbackRecord)
            );
            analyticsReporter.sendEvent(
              EVENTS.LESSON_SNAPSHOT_AI_FEEDBACK_GENERATED,
              {}
            );
            analyticsReporter.sendEvent(
              EVENTS.LESSON_SNAPSHOT_FEEDBACK_WIDGET_LOADED,
              {}
            );
          }
        } else {
          const data = await response.json();
          if (data.saved_feedback) {
            setFeedbackText(data.saved_feedback);
            analyticsReporter.sendEvent(
              EVENTS.LESSON_SNAPSHOT_FEEDBACK_WIDGET_LOADED,
              {}
            );
          }
          setExistingFeedbackData(data);
          setSavedOrSubmittedTimestamp(determineTimeStamp(data));
          if (data.resources && data.resources.length > 0) {
            setResourceData(data.resources);
          } else {
            setResourceData([DEFAULT_RESOURCE]);
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
        setResourceData([DEFAULT_RESOURCE]);
        // Ensure state is cleared on error so we don't use stale feedback data
        setExistingFeedbackData(null);
        setSavedOrSubmittedTimestamp(null);
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
    if (!lessonId || !studentId) {
      console.error('Cannot save feedback: missing required IDs', {
        lessonId,
        studentId,
        sectionId,
      });
      return null;
    }

    try {
      let response;
      setIsSaving(true);
      if (feedbackId) {
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
        // Create new feedback - always use current prop values
        const newFeedbackPayload = {
          lesson_id: lessonId,
          student_id: studentId,
          section_id: sectionId,
          ...payload,
        };

        response = await fetch('/lesson_feedbacks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': await getAuthenticityToken(),
          },
          body: JSON.stringify(newFeedbackPayload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save feedback');
      }
      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Error saving feedback:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const userHasEditedAiFeedback = () => {
    const isLookingAtOriginalAiFeedback =
      existingFeedbackData &&
      existingFeedbackData.updated_at === existingFeedbackData.created_at;

    const hasEdited = feedbackText !== existingFeedbackData?.saved_feedback;
    return isLookingAtOriginalAiFeedback && hasEdited;
  };

  // Helper function to generate common analytics properties for feedback actions
  const getCommonAnalyticsProperties = () => {
    const hasRecommendedAction = !!(
      resourceData[0]?.recommended_action &&
      resourceData[0].recommended_action.trim()
    );
    const hasRecommendActionLink = !!(
      resourceData[0]?.resource_link && resourceData[0].resource_link.trim()
    );

    return {
      aiFeedbackEdited: userHasEditedAiFeedback(),
      hasRecommendedAction,
      recommendedActionCharacterCount: resourceData[0]?.recommended_action
        ? resourceData[0].recommended_action.trim().length
        : 0,
      hasRecommendActionLink,
      resourceLinkCount: hasRecommendActionLink ? 1 : 0,
    };
  };

  const handleSaveAsDraft = async () => {
    const newFeedbackData = {
      ...existingFeedbackData,
      saved_feedback: feedbackText,
      resources: resourceData,
    };

    setExistingFeedbackData(newFeedbackData);

    try {
      const savedData = await persistFeedbackToBackend(
        newFeedbackData,
        existingFeedbackData?.id
      );
      analyticsReporter.sendEvent(
        EVENTS.LESSON_SNAPSHOT_SAVE_AS_DRAFT_CLICKED,
        getCommonAnalyticsProperties()
      );

      setExistingFeedbackData(savedData);
      setSavedOrSubmittedTimestamp(determineTimeStamp(savedData));
    } catch (error) {
      console.error('Failed to save feedback as draft:', error);
    }
  };

  const handleSendToStudent = async () => {
    const analyticsProperties = getCommonAnalyticsProperties();

    analyticsReporter.sendEvent(
      EVENTS.LESSON_SNAPSHOT_SEND_FEEDBACK_TO_STUDENT_CLICKED,
      analyticsProperties
    );
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

    try {
      const savedData = await persistFeedbackToBackend(
        newFeedbackData,
        existingFeedbackData?.id
      );

      setExistingFeedbackData(savedData);
      setSavedOrSubmittedTimestamp(determineTimeStamp(savedData));
    } catch (error) {
      console.error('Failed to send feedback to student:', error);
    }
  };

  const getFormattedTimestamp = () => {
    if (!savedOrSubmittedTimestamp) return '';
    const dateStr = savedOrSubmittedTimestamp.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const timeStr = savedOrSubmittedTimestamp.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const action = existingFeedbackData?.submitted_at
      ? 'submitted to student on'
      : 'saved on';
    return `Last ${action} ${dateStr} at ${timeStr}`;
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
      <div className={styles.footerWrapper}>
        {savedOrSubmittedTimestamp && (
          <div className={styles.submittedAtText}>
            {getFormattedTimestamp()}
          </div>
        )}
        <ActionButtons
          onSaveAsDraft={handleSaveAsDraft}
          onSendToStudent={handleSendToStudent}
          isSaving={isSaving}
        />
      </div>
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
