import Dialog from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Tabs from '@code-dot-org/component-library/tabs';
import {Button, IconButton, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import AnswersTab from './QuizQuestionCard/AnswersTab';
import QuestionTab from './QuizQuestionCard/QuestionTab';
import UsageTab from './QuizQuestionCard/UsageTab';
import {QuizBuilderQuestion, QuizQuestionEditableFields} from './types';

import styles from './quiz-question-card.module.scss';

interface QuizQuestionCardProps {
  question: QuizBuilderQuestion;
  startExpanded?: boolean;
  onUpdate: (
    id: number,
    payload: QuizQuestionEditableFields
  ) => Promise<boolean>;
  onRemove: (id: number) => Promise<boolean>;
}

function toDraft(question: QuizBuilderQuestion): QuizQuestionEditableFields {
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
  startExpanded = false,
  onUpdate,
  onRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(startExpanded);
  const [draft, setDraft] = useState(() => toDraft(question));
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  // A save can fork the question into a new id (see
  // useQuizBuilderQuestions#updateQuestion) - resync the draft whenever the
  // identity of the question this card is editing changes.
  useEffect(() => {
    setDraft(toDraft(question));
  }, [question]);

  const handleSave = async () => {
    setIsSaving(true);
    const succeeded = await onUpdate(question.id, draft);
    setIsSaving(false);
    if (succeeded) {
      setIsExpanded(false);
    }
  };

  const handleDiscard = () => {
    setDraft(toDraft(question));
  };

  const handleConfirmRemove = async () => {
    setIsRemoving(true);
    await onRemove(question.id);
    setIsRemoving(false);
    setIsConfirmingRemove(false);
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
        <IconButton
          aria-label={isExpanded ? 'Collapse question' : 'Edit question'}
          size="extraSmall"
          variant="outlined"
          color="secondary"
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
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

          <div className={styles.footer}>
            <Button
              variant="outlined"
              color="error"
              size="extraSmall"
              type="button"
              disabled={isRemoving}
              onClick={() => setIsConfirmingRemove(true)}
            >
              Remove from quiz
            </Button>
            <div className={styles.footerActions}>
              <Button
                variant="text"
                color="tertiary"
                size="extraSmall"
                type="button"
                disabled={isSaving}
                onClick={handleDiscard}
              >
                Discard changes
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="extraSmall"
                type="button"
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

      {isConfirmingRemove && (
        <Dialog
          title="Remove from quiz"
          description="This only removes the question from this quiz - it stays in the question bank and on any other quiz that uses it."
          onClose={() => setIsConfirmingRemove(false)}
          primaryButtonProps={{
            children: 'Remove',
            color: 'error',
            loading: isRemoving,
            onClick: handleConfirmRemove,
          }}
          secondaryButtonProps={{
            children: 'Cancel',
            color: 'tertiary',
            variant: 'outlined',
            onClick: () => setIsConfirmingRemove(false),
          }}
        />
      )}
    </div>
  );
};

export default QuizQuestionCard;
