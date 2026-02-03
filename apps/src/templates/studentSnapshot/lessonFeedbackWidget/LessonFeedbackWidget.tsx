import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import {
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';
import React, {useEffect, useState} from 'react';

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
  studentId: number | null;
  teacherHasEnabledAi: boolean;
}

const LessonFeedbackWidget: React.FC<LessonFeedbackWidgetProps> = ({
  lessonId,
  studentId,
  teacherHasEnabledAi = false,
}) => {
  const [initialFeedback, setInitialFeedback] = useState<string>('');
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);

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

  // Fetch lesson feedback from backend
  useEffect(() => {
    async function fetchLessonFeedback() {
      if (!lessonId || !studentId) return;
      setFeedbackLoading(true);
      try {
        const response = await fetch(
          `/lesson_feedbacks/saved_feedback?lesson_id=${lessonId}&student_id=${studentId}`
        );
        if (!response.ok) throw new Error('Failed to fetch feedback');
        const data = await response.json();
        setInitialFeedback(data.saved_feedback);
      } catch (error) {
        console.error('Error in final step:' + error);
      } finally {
        setFeedbackLoading(false);
      }
    }
    fetchLessonFeedback();
  }, [lessonId, studentId]);

  let widgetContent: React.ReactNode;
  // TO DO: Use Loading widget when needed here.
  if (feedbackLoading) {
    widgetContent = <BodyThreeText>Loading feedback...</BodyThreeText>;
  } else {
    widgetContent = (
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
  }

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
