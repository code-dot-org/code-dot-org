import Tabs from '@code-dot-org/component-library/tabs';
import isEqual from 'lodash/isEqual';
import React, {useEffect, useState} from 'react';

import BuilderCard from '../BuilderCard';
import {QUESTION_TYPE_LABELS_ICONS} from '../constants';
import {
  isPendingQuestionId,
  QuizBuilderQuestion,
  QuizQuestionDraft,
} from '../types';

import AnswersTab from './AnswersTab';
import QuestionTab from './QuestionTab';
import UsageTab from './UsageTab';

import styles from './quiz-question-card.module.scss';

interface QuizQuestionCardProps {
  question: QuizBuilderQuestion;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  error?: string | null;
  onSave: (
    id: number,
    payload: QuizQuestionDraft
  ) => Promise<number | undefined>;
  onRemove: (id: number) => Promise<boolean>;
}

function toDraft(question: QuizBuilderQuestion): QuizQuestionDraft {
  const shared = {
    questionName: question.questionName,
    questionTitle: question.questionTitle,
    description: question.description,
    explanation: question.explanation,
  };
  return question.type === 'MultipleChoiceQuestion'
    ? {
        ...shared,
        type: question.type,
        choices: question.choices,
        correctChoiceId: question.correctChoiceId,
      }
    : {...shared, type: question.type};
}

// One row of the quiz outline. Collapsed, it's a read-only preview; expanded,
// it's a full editor (Question / Answers / Usage tabs) with its own draft
// state, saved or discarded independently of the rest of the outline.
const QuizQuestionCard: React.FunctionComponent<QuizQuestionCardProps> = ({
  question,
  isExpanded,
  onExpandedChange,
  error,
  onSave,
  onRemove,
}) => {
  const [draft, setDraft] = useState(() => toDraft(question));
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const isBusy = isSaving || isRemoving;
  // A pending question (see isPendingQuestionId) doesn't exist on the
  // server yet, so it counts as dirty even untouched - otherwise Save
  // would start out disabled with nothing to enable it.
  const isDirty =
    isPendingQuestionId(question.id) || !isEqual(draft, toDraft(question));

  // A save can fork the question into a new id (see
  // useQuizBuilderQuestions#saveQuestion) - resync the draft whenever the
  // identity of the question this card is editing changes.
  useEffect(() => {
    setDraft(toDraft(question));
  }, [question]);

  const handleSave = async () => {
    setIsSaving(true);
    const updatedId = await onSave(question.id, draft);
    setIsSaving(false);
    if (updatedId !== undefined) {
      onExpandedChange(false);
    }
  };

  const handleDiscard = () => {
    setDraft(toDraft(question));
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await onRemove(question.id);
    setIsRemoving(false);
  };

  return (
    <BuilderCard
      iconName={QUESTION_TYPE_LABELS_ICONS[question.type].iconName}
      name={draft.questionName}
      preview={draft.questionTitle}
      itemLabel="question"
      isExpanded={isExpanded}
      onExpandedChange={onExpandedChange}
      isDirty={isDirty}
      isSaving={isSaving}
      isRemoving={isRemoving}
      error={error}
      onSave={handleSave}
      onDiscard={handleDiscard}
      onRemove={handleRemove}
    >
      <Tabs
        name={`question-${question.id}-tabs`}
        defaultSelectedTabValue="question"
        tabsContainerClassName={styles.tabsRow}
        tabPanelsContainerClassName={styles.tabPanels}
        tabs={[
          {
            value: 'question',
            text: 'Question',
            tabContent: (
              <QuestionTab
                draft={draft}
                onChange={setDraft}
                disabled={isBusy}
              />
            ),
          },
          {
            value: 'answers',
            text: 'Answers',
            tabContent: (
              <AnswersTab draft={draft} onChange={setDraft} disabled={isBusy} />
            ),
          },
          {
            value: 'usage',
            text: 'Usage',
            tabContent: <UsageTab question={question} />,
          },
        ]}
        onChange={() => {}}
      />
    </BuilderCard>
  );
};

export default QuizQuestionCard;
