import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tabs from '@code-dot-org/component-library/tabs';
import {Button, IconButton, Tooltip, Typography} from '@mui/material';
import isEqual from 'lodash/isEqual';
import React, {useEffect, useState} from 'react';

import {QuizBuilderQuestion, QuizQuestionEditableFields} from '../types';

import AnswersTab from './AnswersTab';
import QuestionTab from './QuestionTab';
import UsageTab from './UsageTab';

import styles from './quiz-question-card.module.scss';

interface QuizQuestionCardProps {
  question: QuizBuilderQuestion;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  error?: string | null;
  onUpdate: (
    id: number,
    payload: QuizQuestionEditableFields
  ) => Promise<number | undefined>;
  onRemove: (id: number) => Promise<boolean>;
}

function toEditableFields(
  question: QuizBuilderQuestion
): QuizQuestionEditableFields {
  return {
    questionName: question.questionName,
    stem: question.stem,
    choices: question.choices,
    correctChoiceId: question.correctChoiceId,
    explanation: question.explanation,
  };
}

// One row of the quiz outline. Collapsed, it's a read-only preview; expanded,
// it's a full editor (Question / Answers / Usage tabs) with its own draft
// state, saved or discarded independently of the rest of the outline.
const QuizQuestionCard: React.FunctionComponent<QuizQuestionCardProps> = ({
  question,
  isExpanded,
  onExpandedChange,
  error,
  onUpdate,
  onRemove,
}) => {
  const [draft, setDraft] = useState(() => toEditableFields(question));
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const isDirty = !isEqual(draft, toEditableFields(question));

  // A save can fork the question into a new id (see
  // useQuizBuilderQuestions#updateQuestion) - resync the draft whenever the
  // identity of the question this card is editing changes.
  useEffect(() => {
    setDraft(toEditableFields(question));
  }, [question]);

  const handleSave = async () => {
    setIsSaving(true);
    const updatedId = await onUpdate(question.id, draft);
    setIsSaving(false);
    if (updatedId !== undefined) {
      onExpandedChange(false);
    }
  };

  const handleDiscard = () => {
    setDraft(toEditableFields(question));
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(question.id);
    setIsRemoving(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerPreview}>
          <FontAwesomeV6Icon
            iconName="list-check"
            className={styles.typeIcon}
          />
          <Typography variant="strong" component="span">
            {question.questionName}
          </Typography>
          <Typography
            variant="body3"
            component="span"
            className={styles.stemPreview}
          >
            {question.stem}
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
          aria-label={isExpanded ? 'Collapse question' : 'Edit question'}
          size="extraSmall"
          variant="outlined"
          color="secondary"
          type="button"
          onClick={() => onExpandedChange(!isExpanded)}
        >
          <FontAwesomeV6Icon
            iconName={isExpanded ? 'chevron-up' : 'chevron-down'}
          />
        </IconButton>
      </div>

      {isExpanded && (
        <>
          <Tabs
            name={`question-${question.id}-tabs`}
            defaultSelectedTabValue="question"
            tabsContainerClassName={styles.tabsRow}
            tabPanelsContainerClassName={styles.tabPanels}
            tabs={[
              {
                value: 'question',
                text: 'Question',
                tabContent: <QuestionTab draft={draft} onChange={setDraft} />,
              },
              {
                value: 'answers',
                text: 'Answers',
                tabContent: <AnswersTab draft={draft} onChange={setDraft} />,
              },
              {
                value: 'usage',
                text: 'Usage',
                tabContent: <UsageTab question={question} />,
              },
            ]}
            onChange={() => {}}
          />

          {error && (
            <Alert
              type="danger"
              size="xs"
              text={error}
              className={styles.saveError}
            />
          )}

          <div className={styles.footer}>
            <Button
              variant="outlined"
              color="error"
              size="extraSmall"
              type="button"
              disabled={isRemoving}
              loading={isRemoving}
              onClick={handleRemove}
            >
              Remove from quiz
            </Button>
            <div className={styles.footerActions}>
              <Button
                variant="outlined"
                color="secondary"
                size="extraSmall"
                type="button"
                disabled={isSaving || !isDirty}
                onClick={handleDiscard}
              >
                Discard changes
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="extraSmall"
                type="button"
                disabled={!isDirty}
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

export default QuizQuestionCard;
