import {ActionDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useRef, useState} from 'react';

import {QuizQuestionType} from '../types';

import CreateQuestionDropdown from './CreateQuestionDropdown';
import QuizQuestionCard from './QuizQuestionCard';
import {QuizBuilderQuestion} from './types';

import styles from './quiz-builder-workspace.module.scss';

export function OutlineTick({size}: {size: 'block' | 'item'}) {
  return (
    <div
      className={classNames(
        styles.connector,
        size === 'block' ? styles.connectorBlock : styles.connectorItem
      )}
      aria-hidden
    >
      <span className={styles.tick} />
    </div>
  );
}

export function questionCountLabel(count: number): string {
  return count === 1 ? '1 question' : `${count} questions`;
}

interface QuizPageBlockProps {
  page: number;
  questions: QuizBuilderQuestion[];
  // Flat when this is the quiz's only page and it already has questions.
  chrome: boolean;
  expandedId: number | null;
  onExpandedChange: (questionId: number, expanded: boolean) => void;
  error: string | null;
  errorQuestionId: number | null;
  onSave: React.ComponentProps<typeof QuizQuestionCard>['onSave'];
  onRemove: React.ComponentProps<typeof QuizQuestionCard>['onRemove'];
  onCreate: (type: QuizQuestionType) => void;
  createDisabledReason?: string;
  // Set only for the unsaved empty page. A page that has questions stays.
  onDismiss?: () => void;
}

const QuizPageBlock: React.FunctionComponent<QuizPageBlockProps> = ({
  page,
  questions,
  chrome,
  expandedId,
  onExpandedChange,
  error,
  errorQuestionId,
  onSave,
  onRemove,
  onCreate,
  createDisabledReason,
  onDismiss,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pageTitle = `Page ${page}`;
  const nested = chrome;

  const toggleCollapsed = () => {
    const willCollapse = !collapsed;
    if (willCollapse) {
      const active = document.activeElement;
      if (active instanceof HTMLElement && bodyRef.current?.contains(active)) {
        toggleRef.current?.focus();
      }
    }
    setCollapsed(willCollapse);
  };

  const stack = (
    <>
      <ol className={styles.questionList}>
        {questions.map((question, index) => (
          <li key={question.id}>
            {index > 0 && <OutlineTick size="item" />}
            <QuizQuestionCard
              question={question}
              nested={nested}
              isExpanded={question.id === expandedId}
              onExpandedChange={expanded =>
                onExpandedChange(question.id, expanded)
              }
              error={question.id === errorQuestionId ? error : null}
              onSave={onSave}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ol>
      <OutlineTick size="item" />
      <div
        className={classNames(
          styles.addQuestionRow,
          nested && styles.addQuestionRowNested
        )}
      >
        <CreateQuestionDropdown
          name={`create-question-page-${page}`}
          variant="text"
          onCreate={onCreate}
          disabledReason={createDisabledReason}
        />
      </div>
    </>
  );

  const body =
    questions.length === 0 ? (
      <div
        className={styles.emptyPage}
        role="region"
        aria-labelledby={`quiz-page-${page}-empty`}
      >
        <div className={styles.emptyPageCopy}>
          <Typography
            variant="body3"
            component="p"
            id={`quiz-page-${page}-empty`}
            className={styles.emptyPageTitle}
          >
            This page is empty
          </Typography>
          <Typography
            variant="body4"
            component="p"
            className={styles.emptyPageHint}
          >
            Create a question to start this page.
          </Typography>
        </div>
        <CreateQuestionDropdown
          name={`create-question-page-${page}`}
          onCreate={onCreate}
          disabledReason={createDisabledReason}
        />
      </div>
    ) : (
      stack
    );

  if (!chrome) {
    return body;
  }

  const deck = collapsed && questions.length > 0;

  return (
    <div className={classNames(styles.pageBlock, deck && styles.pageBlockDeck)}>
      <section
        className={classNames(styles.page, deck && styles.pageDeck)}
        aria-labelledby={`quiz-page-${page}-title`}
      >
        <div
          className={classNames(
            styles.pageHeader,
            !collapsed && styles.pageHeaderOpen
          )}
        >
          <div className={styles.pageHeaderPreview}>
            <Typography
              variant="body3"
              component="h2"
              id={`quiz-page-${page}-title`}
              className={styles.pageTitle}
            >
              {pageTitle}
            </Typography>
            <span className={styles.dot} aria-hidden />
            <Typography
              variant="body3"
              component="span"
              className={styles.pageCount}
            >
              {questionCountLabel(questions.length)}
            </Typography>
          </div>
          <div className={styles.pageActions}>
            {onDismiss && (
              <ActionDropdown
                name={`page-${page}-options`}
                labelText={`${pageTitle} options`}
                size="xs"
                menuPlacement="right"
                triggerButtonProps={{
                  color: 'tertiary',
                  variant: 'text',
                  size: 'extraSmall',
                  children: <FontAwesomeV6Icon iconName="ellipsis-vertical" />,
                }}
                options={[
                  {
                    value: 'delete',
                    label: 'Delete page',
                    isOptionDestructive: true,
                    icon: {iconName: 'trash', iconStyle: 'solid'},
                    onClick: onDismiss,
                  },
                ]}
              />
            )}
            <IconButton
              ref={toggleRef}
              id={`quiz-page-${page}-toggle`}
              aria-label={
                collapsed ? `Expand ${pageTitle}` : `Collapse ${pageTitle}`
              }
              aria-expanded={!collapsed}
              aria-controls={`quiz-page-${page}-body`}
              size="extraSmall"
              variant="outlined"
              color="tertiary"
              type="button"
              onClick={toggleCollapsed}
            >
              <FontAwesomeV6Icon
                iconName={collapsed ? 'chevron-down' : 'chevron-up'}
              />
            </IconButton>
          </div>
        </div>
        <div
          ref={bodyRef}
          id={`quiz-page-${page}-body`}
          className={styles.pageBody}
          hidden={collapsed}
        >
          {body}
        </div>
      </section>
    </div>
  );
};

export default QuizPageBlock;
