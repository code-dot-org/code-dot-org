import Alert from '@code-dot-org/component-library/alert';
import {Button} from '@code-dot-org/component-library/button';
import TextField from '@code-dot-org/component-library/textField';
import {
  BodyThreeText,
  BodyFourText,
} from '@code-dot-org/component-library/typography';
import {Divider} from '@mui/material';
import React, {useEffect, useState} from 'react';

import AccessibleDialog from '@cdo/apps/sharedComponents/AccessibleDialog';
import WidgetTemplate from '@cdo/apps/templates/studentSnapshot/widgetTemplate';
import i18n from '@cdo/locale';

import FeedbackTextbox from './FeedbackTextbox';
import UrlTab from './UrlTab';

import styles from './lessonFeeedback.module.scss';

interface LessonFeedbackWidgetProps {
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
  lessonId,
  studentId,
  teacherHasEnabledAi = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddResourcePopup, setShowAddResourcePopup] = useState(false);
  const [resourceLink, setResourceLink] = useState('');
  const [tempResourceLink, setTempResourceLink] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [tempResourceName, setTempResourceName] = useState('');

  /**

PRE SAVED DATA

initialAiFeedback: "TEXT"
teacherEditedFeedback: "TEXT"
recommendedActions: [. <= Should this be it's own data type
  {
    resourceLink: "URL"
    resourceName: "TEXT"
    actionDescription: "TEXT"
  }
]
 */

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
        <div>
          <label className={styles.typographyLabelTwo}>{i18n.feedback()}</label>
          <FeedbackTextbox
            feedbackText="PLACEHOLDER - This is where the feedback text will go."
            onFeedbackChange={newText => {
              console.log('Feedback changed:', newText);
            }}
          />
        </div>
        <div>
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
              onChange={e => {
                console.log('Recommended action changed:', e.target.value);
              }}
            />
            <Button
              text={'Add resource link'}
              size="xs"
              type="secondary"
              color="gray"
              iconLeft={{
                iconStyle: 'solid',
                iconName: 'plus',
                title: 'Add Resource',
              }}
              onClick={() => {
                setShowAddResourcePopup(true);
              }}
            />
            {resourceLink && resourceName && (
              <UrlTab
                urlName={resourceName}
                onClick={() => console.log('URL clicked')}
              />
            )}
          </div>
          {showAddResourcePopup && (
            <AccessibleDialog onClose={() => setShowAddResourcePopup(false)}>
              <div className={styles.popUpContainer}>
                <TextField
                  className={styles.resourceLinkInput}
                  label="Resource name"
                  name="resouce name"
                  value={tempResourceName}
                  onChange={e => setTempResourceName(e.target.value)}
                />
                <TextField
                  className={styles.resourceLinkInput}
                  label="Add a link to the resource"
                  name="resouce link"
                  value={tempResourceLink}
                  onChange={e => setTempResourceLink(e.target.value)}
                />
                <Divider className={styles.resourcePopUpDivider} />
                <div className={styles.resourceLinkPopUpButtons}>
                  <Button
                    text="Cancel"
                    type="secondary"
                    onClick={() => {
                      setTempResourceName('');
                      setTempResourceLink('');
                      setShowAddResourcePopup(false);
                    }}
                  />
                  <Button
                    text="Save"
                    onClick={() => {
                      setResourceName(tempResourceName);
                      setResourceLink(tempResourceLink);
                      setTempResourceName('');
                      setTempResourceLink('');
                      setShowAddResourcePopup(false);
                    }}
                  />
                </div>
              </div>
            </AccessibleDialog>
          )}
        </div>
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
