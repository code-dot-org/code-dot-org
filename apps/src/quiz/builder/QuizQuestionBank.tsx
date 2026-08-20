import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FormFieldWrapper from '@code-dot-org/component-library/formFieldWrapper';
import TextField from '@code-dot-org/component-library/textField';
import {Button as MuiButton, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';

import SearchBox from '@cdo/apps/levelbuilder/lesson-editor/SearchBox';
import HttpClient from '@cdo/apps/util/HttpClient';

import {QuizQuestionData} from './QuizBuilder';
import {QuizStandard} from './QuizQuestionForm';

import styles from './quiz-question-bank.module.scss';

interface BankQuestion extends QuizQuestionData {
  attached: boolean;
}

interface QuizQuestionBankProps {
  quizId: number;
  // Ids currently on this quiz - the only source used to decide each
  // result's Add/Added state (see the attachedQuestionIds.includes check
  // below). Kept in Quiz.tsx from the live `questions` list, so it stays
  // correct as questions get added, edited, or removed anywhere on the
  // page, not just fetched once alongside the bank's own search results.
  attachedQuestionIds: number[];
  // Question ids permanently deleted in this session (via destroy_quiz_question,
  // not detach_quiz_question). A bank search fetched before the delete can
  // still have one of these cached in `results`; this hides it, since the
  // question no longer exists for the "Add" button to attach.
  excludedQuestionIds: number[];
  onAttach: (question: QuizQuestionData) => void;
}

// Search-as-you-type debounce - avoids firing a request per keystroke.
const SEARCH_DEBOUNCE_MS = 300;

// Mirrors QuizQuestionAutocomplete::SORT_ORDERS keys.
const SORT_OPTIONS = [
  {value: 'recent', text: 'Recently added'},
  {value: 'name', text: 'Alphabetical (A-Z)'},
];

interface StandardSearchOption {
  value: string;
  label: string;
  standard: QuizStandard;
}

// Question bank: browse/search existing MultipleChoiceQuestions and attach
// one to this quiz (creating a new QuizLevelQuestion, not a new question
// row) - see LevelsController#index_quiz_questions/#attach_quiz_question.
// P0 scope: search by question name only; standard/unit/course filters are
// later work.
const QuizQuestionBank: React.FunctionComponent<QuizQuestionBankProps> = ({
  quizId,
  attachedQuestionIds,
  excludedQuestionIds,
  onAttach,
}) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('recent');
  const [standardFilter, setStandardFilter] = useState<QuizStandard | null>(
    null
  );
  const [results, setResults] = useState<BankQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachingId, setAttachingId] = useState<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      // limit=80 requests QuizQuestionAutocomplete::MAX_LIMIT explicitly -
      // an omitted limit param clamps to MIN_LIMIT (1) server-side, not a
      // sensible default, which would make an empty search "browse the
      // bank" show a single question instead of a real list.
      const standardParams = standardFilter
        ? `&standardFrameworkShortcode=${encodeURIComponent(
            standardFilter.frameworkShortcode
          )}&standardShortcode=${encodeURIComponent(standardFilter.shortcode)}`
        : '';
      HttpClient.get(
        `/levels/${quizId}/quiz_questions?search=${encodeURIComponent(
          search
        )}&limit=80&sort=${sort}${standardParams}`
      )
        .then(response => {
          if (!response.ok) {
            throw new Error();
          }
          return response.json();
        })
        .then(data => setResults(data))
        .catch(() => setError('Could not load the question bank.'))
        .finally(() => setIsLoading(false));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [quizId, search, sort, standardFilter]);

  const attach = async (question: BankQuestion) => {
    setAttachingId(question.id);
    try {
      const response = await HttpClient.post(
        `/levels/${quizId}/quiz_questions/${question.id}/attach`,
        JSON.stringify({}),
        true,
        {'Content-Type': 'application/json'}
      );
      if (!response.ok) {
        setError('Could not attach this question.');
        return;
      }
      const attached = await response.json();
      // onAttach bubbles up to Quiz.tsx's setQuestions, which is what
      // attachedQuestionIds below is derived from - no need to also patch
      // this row's local `attached` field, since the render no longer
      // reads it (see the attachedQuestionIds.includes check below).
      onAttach(attached);
    } finally {
      setAttachingId(null);
    }
  };

  const visibleResults = results.filter(
    question => !excludedQuestionIds.includes(question.id)
  );

  return (
    <div className={styles.root}>
      <div className={styles.searchField}>
        <SimpleDropdown
          name="questionBankSort"
          size="s"
          dropdownTextThickness="thin"
          labelText="Sort by"
          items={SORT_OPTIONS.map(option => ({
            value: option.value,
            text: option.text,
          }))}
          selectedValue={sort}
          onChange={e => setSort(e.target.value)}
        />
        <TextField
          label="Search by question name"
          name="questionBankSearch"
          size="s"
          className={styles.fullWidthField}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <FormFieldWrapper
          color="black"
          size="s"
          label="Filter by standard"
          className={styles.fullWidthField}
        >
          {standardFilter ? (
            <div className={styles.standardFilter}>
              <Typography variant="body3">
                {standardFilter.frameworkShortcode.toUpperCase()} -{' '}
                {standardFilter.shortcode}
              </Typography>
              <MuiButton
                variant="text"
                color="secondary"
                size="small"
                type="button"
                onClick={() => setStandardFilter(null)}
              >
                Clear
              </MuiButton>
            </div>
          ) : (
            <SearchBox
              onSearchSelect={(option: StandardSearchOption) =>
                option && setStandardFilter(option.standard)
              }
              searchUrl="standards/search"
              constructOptions={(json: QuizStandard[]) => ({
                options: json.map(standard => ({
                  value: `${standard.frameworkShortcode}-${standard.shortcode}`,
                  label: `${standard.frameworkShortcode.toUpperCase()} - ${
                    standard.shortcode
                  } - ${standard.description}`,
                  standard,
                })),
              })}
            />
          )}
        </FormFieldWrapper>
      </div>
      {error && (
        <Typography variant="body3" color="error">
          {error}
        </Typography>
      )}
      <Typography variant="overline3">Questions</Typography>
      {isLoading ? (
        <Typography variant="body3">Loading…</Typography>
      ) : (
        <ul className={styles.resultList}>
          {visibleResults.length === 0 && (
            <Typography variant="body3">No questions found.</Typography>
          )}
          {visibleResults.map(question => {
            // attachedQuestionIds (from the live `questions` list on Quiz.tsx)
            // is trusted alone, not OR'd with the fetch-time question.attached
            // - that field never gets un-set, so an OR could never reflect a
            // question being removed from this quiz after this list loaded.
            const attached = attachedQuestionIds.includes(question.id);
            return (
              <li key={question.id} className={styles.resultRow}>
                <Typography variant="body2" className={styles.resultPrompt}>
                  {question.stem || question.questionName}
                </Typography>
                <MuiButton
                  variant={attached ? 'text' : 'outlined'}
                  color="secondary"
                  size="small"
                  type="button"
                  disabled={attached || attachingId === question.id}
                  onClick={() => attach(question)}
                >
                  {attached ? 'Added' : 'Add'}
                </MuiButton>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default QuizQuestionBank;
