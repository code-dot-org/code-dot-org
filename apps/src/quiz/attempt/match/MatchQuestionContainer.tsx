import React, {useId, useState} from 'react';

import {QuizQuestionSummary} from '@cdo/apps/quiz/types';

import AttemptCard from '../AttemptCard';
import QuestionDescription from '../QuestionDescription';

import MatchBoard from './MatchBoard';
import {MatchPairs, MatchSelection, MatchSide} from './types';
import {
  findPartner,
  getItemText,
  NO_MATCH_SETS,
  pairTogether,
  unpairItem,
} from './utils';

import styles from './match-question-container.module.scss';

export interface MatchQuestionContainerProps {
  question: Omit<QuizQuestionSummary, 'page'>;
  // Omit for a quiz with only one question.
  questionLabel?: string;
  pairs: MatchPairs;
  onChangePairs: (pairs: MatchPairs) => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
  disabled?: boolean;
}

const MatchQuestionContainer: React.FunctionComponent<
  MatchQuestionContainerProps
> = ({question, questionLabel, pairs, onChangePairs, headingRef, disabled}) => {
  const matchSets = question.matchSets ?? NO_MATCH_SETS;
  // The currently selected items in each column, if any.
  // Once both are set, a pair is formed, and the selection is subsequently cleared (see handleClick).
  // For example, {start: 'abc-123', end: undefined} means the first column has item with ID 'abc-123' selected,
  // and the second column does not have a selected item.
  const [selection, setSelection] = useState<MatchSelection>({});
  // Read out by a live region: a screen reader won't re-announce the name
  // of the card that's already focused when a pairing changes it.
  const [announcement, setAnnouncement] = useState('');
  const instructionsId = useId();
  const handleClick = (side: MatchSide, id: string) => {
    const next: MatchSelection = {...selection, [side]: id};
    const {start, end} = next;
    // Both columns have a selection: pair them.
    if (start && end) {
      const previousPartnerId = findPartner(pairs, id);
      const matchedAnnouncement = `Matched ${getItemText(
        matchSets,
        start
      )} with ${getItemText(matchSets, end)}.`;
      setAnnouncement(
        previousPartnerId
          ? `${matchedAnnouncement} ${getItemText(
              matchSets,
              previousPartnerId
            )} is no longer matched.`
          : matchedAnnouncement
      );
      onChangePairs(pairTogether(pairs, [start, end]));
      setSelection({});
      return;
    }

    // Item has been previously selected: tapping the selected item again deselects it.
    if (selection[side] === id) {
      setSelection({});
      return;
    }

    // Item is not currently selected: the tapped item becomes the selection.
    // A matched item is unmatched first, so it can be matched again.
    const partnerId = findPartner(pairs, id);
    if (partnerId) {
      onChangePairs(unpairItem(pairs, id));
      setAnnouncement(
        `Unmatched ${getItemText(matchSets, id)} from ${getItemText(
          matchSets,
          partnerId
        )}. Select an item in the other column to match it.`
      );
    }
    setSelection({[side]: id});
  };

  return (
    <AttemptCard
      label={questionLabel}
      title={question.questionTitle}
      headingRef={headingRef}
      description={<QuestionDescription markdown={question.description} />}
    >
      <p id={instructionsId} className={styles.srOnly}>
        Select an item in one column, then an item in the other column to match
        them. Selecting a matched item unmatches it.
      </p>
      <MatchBoard
        matchSets={matchSets}
        pairs={pairs}
        onClickItem={handleClick}
        selection={selection}
        disabled={disabled}
        label={question.questionTitle}
        describedBy={instructionsId}
      />
      <div role="status" className={styles.srOnly}>
        {announcement}
      </div>
    </AttemptCard>
  );
};

export default MatchQuestionContainer;
