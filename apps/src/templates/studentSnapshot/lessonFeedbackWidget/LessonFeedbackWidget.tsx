import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import {BodyFourText} from '@code-dot-org/component-library/typography';
import React from 'react';

import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import i18n from '@cdo/locale';

import ActionButtons from './ActionButtons';
import AddResourceDialog from './AddResourceDialog';
import FeedbackTextbox from './FeedbackTextbox';
import UrlTab from './UrlTab';
import {useLessonFeedback} from './useLessonFeedback';

import styles from './lessonFeeedback.module.scss';

interface LessonFeedbackWidgetProps {
  lessonId: number | null;
  teacherHasEnabledAi: boolean;
  studentId: number | null;
  unitId: number | null;
}

const LessonFeedbackWidget: React.FC<LessonFeedbackWidgetProps> = ({
  lessonId,
  teacherHasEnabledAi = false,
  studentId,
  unitId,
}) => {
  const [initialFeedback, setInitialFeedback] = React.useState<string>('');

  // Fetch lesson feedback from backend, and if not found, try generating ai feedback
  // TODO: Add loading state while fetching feedback
  // TODO: check to see if there is progress before getting ai feedback
  React.useEffect(() => {
    async function getAiLessonFeedback(
      lessonId: number,
      unitId: number,
      studentId: number
    ) {
      try {
        const response = await fetch(
          `/student_snapshots/ai_generated_lesson_feedback?lesson_id=${lessonId}&unit_id=${unitId}&student_id=${studentId}`
        );
        if (!response.ok) {
          console.error(
            'Failed to fetch AI lesson feedback:',
            response.status,
            response.statusText
          );
          return null;
        }
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Network or parsing error:', err);
        return null;
      }
    }

    async function fetchLessonFeedback() {
      if (!lessonId || !studentId || !unitId) {
        setInitialFeedback('');
        return;
      }
      setInitialFeedback(''); // Clear feedback before fetching
      try {
        const response = await fetch(
          `/lesson_feedbacks/saved_feedback?lesson_id=${lessonId}&student_id=${studentId}`
        );

        if (!response.ok) {
          // Try getting AI feedback from student work.
          const aiData = await getAiLessonFeedback(lessonId, unitId, studentId);
          if (aiData && aiData.json) {
            const aiGeneratedInitialFeedback = JSON.parse(aiData.json).feedback;
            setInitialFeedback(aiGeneratedInitialFeedback);
          }
        } else {
          const data = await response.json();
          if (data.saved_feedback) {
            setInitialFeedback(data.saved_feedback);
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    }
    fetchLessonFeedback();
  }, [lessonId, studentId, unitId]);
  // Existing hook usage
  const {
    isLoading,
    scrollable,
    feedbackText,
    recommendedActionText,
    resourceLink,
    resourceName,
    showAddResourcePopup,
    tempResourceName,
    tempResourceLink,
    handleFeedbackEdited,
    handleRecommendedActionChange,
    handleAddResourceClick,
    handleCloseResourcePopup,
    handleTempResourceNameChange,
    handleTempResourceLinkChange,
    exitResourcePopup,
    handleResourceSave,
    handleSaveAsDraft,
    handleSendToStudent,
    deleteResourceLink,
  } = useLessonFeedback({
    lessonId,
    teacherHasEnabledAi,
  });

  // TO DO: Use Loading widget when needed here.
  const widgetContent = (
    <div className={styles.topContainer}>
      <Alert
        icon={{iconName: 'sparkles'}}
        text={i18n.lessonFeedbackAlertText()}
        type="aqua"
        className={styles.alertBox}
      />
      <div className={styles.feedbackTextBoxWrapper}>
        <label className={styles.typographyLabelTwo}>{i18n.feedback()}</label>
        <FeedbackTextbox
          feedbackText={feedbackText || initialFeedback}
          onFeedbackChange={handleFeedbackEdited}
        />
      </div>
      <div className={styles.recommendedActionContainer}>
        <label className={styles.typographyLabelTwo}>
          {i18n.lessonFeedbackRecommendedAction()}
        </label>
        <BodyFourText noMargin>
          {i18n.lessonFeedbackRecommendedActionDirections()}
        </BodyFourText>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputBox}
            type="text"
            placeholder={'Write a message'}
            value={recommendedActionText}
            onChange={handleRecommendedActionChange}
          />
          <Button
            text={'Add resource link'}
            size="xs"
            type="secondary"
            color="gray"
            disabled={!!resourceLink}
            iconLeft={{
              iconStyle: 'solid',
              iconName: 'plus',
              title: 'Add Resource',
            }}
            onClick={handleAddResourceClick}
          />
          {resourceLink && resourceName && (
            <UrlTab
              urlName={resourceName}
              onClickHandler={deleteResourceLink}
            />
          )}
        </div>
        {showAddResourcePopup && (
          <AddResourceDialog
            tempResourceName={tempResourceName}
            tempResourceLink={tempResourceLink}
            onResourceNameChange={handleTempResourceNameChange}
            onResourceLinkChange={handleTempResourceLinkChange}
            onCancel={exitResourcePopup}
            onSave={handleResourceSave}
            onClose={handleCloseResourcePopup}
          />
        )}
      </div>
      <ActionButtons
        onSaveAsDraft={handleSaveAsDraft}
        onSendToStudent={handleSendToStudent}
      />
    </div>
  );

  return (
    <WidgetTemplate
      widgetName="Lesson Feedback"
      gridWidth={2}
      gridHeight={2}
      loading={isLoading}
      scrollable={scrollable}
    >
      {widgetContent}
    </WidgetTemplate>
  );
};

export default LessonFeedbackWidget;
