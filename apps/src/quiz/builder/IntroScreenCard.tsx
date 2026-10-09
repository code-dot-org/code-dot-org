import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import {Button, IconButton, Tooltip, Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {networkErrorMessage} from '@cdo/apps/quiz/networkError';

import {QuizConfigurationData} from './QuizConfigurationPanel';

import styles from './QuizQuestionCard/quiz-question-card.module.scss';

interface IntroScreenCardProps {
  customIntroText: string;
  // Intro screen must be shown when a time limit is set.
  hasTimeLimit: boolean;
  onSave: (fields: Partial<QuizConfigurationData>) => Promise<void>;
}

// The intro screen's markdown content, edited in place at the top of the
// quiz outline. Its title is the quiz display name, set in Configuration.
const IntroScreenCard: React.FunctionComponent<IntroScreenCardProps> = ({
  customIntroText,
  hasTimeLimit,
  onSave,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draft, setDraft] = useState(customIntroText);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isBusy = isSaving || isRemoving;
  const isDirty = draft !== customIntroText;
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setDraft(customIntroText);
  }, [customIntroText]);

  const save = async (fields: Partial<QuizConfigurationData>) => {
    setError(null);
    try {
      await onSave(fields);
      return true;
    } catch (e) {
      setError(await networkErrorMessage(e));
      return false;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await save({customIntroText: draft});
    setIsSaving(false);
    if (ok) {
      setIsExpanded(false);
      // Collapsing unmounts the focused Save button.
      toggleButtonRef.current?.focus();
    }
  };

  const handleRemove = async () => {
    if (hasTimeLimit) {
      return;
    }
    setIsRemoving(true);
    await save({showIntroScreen: false});
    setIsRemoving(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerPreview}>
          <FontAwesomeV6Icon iconName="hand-wave" className={styles.typeIcon} />
          <Typography variant="strong" component="span">
            Intro Screen
          </Typography>
          <Typography
            variant="body3"
            component="span"
            className={styles.questionTitlePreview}
          >
            {draft}
          </Typography>
        </div>
        {isDirty && (
          <Tooltip title="Unsaved changes">
            <div className={styles.unsavedBadge} aria-label="Unsaved changes">
              <FontAwesomeV6Icon
                iconName="triangle-exclamation"
                iconStyle="solid"
              />
            </div>
          </Tooltip>
        )}
        <IconButton
          ref={toggleButtonRef}
          aria-label={
            isExpanded ? 'Collapse intro screen' : 'Edit intro screen'
          }
          aria-expanded={isExpanded}
          size="extraSmall"
          variant="outlined"
          color="secondary"
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <FontAwesomeV6Icon
            iconName={isExpanded ? 'chevron-up' : 'pen-to-square'}
          />
        </IconButton>
      </div>

      {isExpanded && (
        <>
          <div className={styles.tabContent}>
            <FormFieldWrapper
              label="Content"
              helperMessage="Supports markdown."
            >
              <textarea
                className={styles.textarea}
                name="customIntroText"
                rows={6}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                disabled={isBusy}
              />
            </FormFieldWrapper>
          </div>

          {error && (
            <Alert
              type="danger"
              size="xs"
              text={error}
              className={styles.saveError}
            />
          )}

          <div className={styles.footer}>
            <Tooltip
              describeChild
              title={
                hasTimeLimit
                  ? 'Remove the time limit in Configuration before removing the intro screen.'
                  : ''
              }
            >
              <Button
                variant="outlined"
                color="error"
                size="extraSmall"
                type="button"
                className={styles.ariaDisabled}
                disabled={isBusy}
                aria-disabled={hasTimeLimit}
                loading={isRemoving}
                onClick={handleRemove}
              >
                Remove from quiz
              </Button>
            </Tooltip>
            <div className={styles.footerActions}>
              <Button
                variant="outlined"
                color="secondary"
                size="extraSmall"
                type="button"
                disabled={isBusy || !isDirty}
                onClick={() => setDraft(customIntroText)}
              >
                Discard changes
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="extraSmall"
                type="button"
                disabled={isBusy || !isDirty}
                loading={isSaving}
                onClick={handleSave}
                startIcon={
                  <FontAwesomeV6Icon iconName="save" iconStyle="solid" />
                }
              >
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default IntroScreenCard;
