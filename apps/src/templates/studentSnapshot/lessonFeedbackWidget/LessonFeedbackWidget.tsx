import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import {
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';
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
  studentId: number;
  teacherHasEnabledAi: boolean;
}

const LessonFeedbackWidget: React.FC<LessonFeedbackWidgetProps> = ({
  lessonId,
  studentId,
  teacherHasEnabledAi = false,
}) => {
  const {
    // State values
    isLoading,
    error,
    scrollable,
    feedbackText,
    recommendedActionText,
    resourceLink,
    resourceName,
    showAddResourcePopup,
    tempResourceName,
    tempResourceLink,
    // Event handlers
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
    studentId,
    teacherHasEnabledAi,
  });

  let widgetContent: React.ReactNode;

  // TODO: Load feedback data from server when API is available - building off Liam's Lesson Insight work
  // Update state according to the data from back end

  if (error) {
    widgetContent = <BodyThreeText>{error}</BodyThreeText>;
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
            feedbackText={feedbackText}
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
