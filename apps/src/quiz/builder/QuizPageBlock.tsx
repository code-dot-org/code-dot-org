import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useId, useRef, useState} from 'react';

import {QuizQuestionType} from '../types';
import {pluralize} from '../utils';

import CreateQuestionDropdown from './CreateQuestionDropdown';
import UnsavedBadge from './UnsavedBadge';

import rowStyles from './outline-row.module.scss';
import styles from './quiz-page-block.module.scss';

interface QuizPageBlockProps {
  page: number;
  questionCount: number;
  onCreate: (type: QuizQuestionType) => void;
  createDisabledReason?: string;
  hasUnsavedQuestion: boolean;
  // One <li> per question.
  children?: React.ReactNode;
}

const QuizPageBlock: React.FunctionComponent<QuizPageBlockProps> = ({
  page,
  questionCount,
  onCreate,
  createDisabledReason,
  hasUnsavedQuestion,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const pageTitle = `Page ${page}`;
  const titleId = useId();
  const bodyId = useId();

  const toggleCollapsed = () => {
    // [hidden] drops a focused control from the tab order, so move focus out first.
    if (!collapsed && bodyRef.current?.contains(document.activeElement)) {
      toggleRef.current?.focus();
    }
    setCollapsed(!collapsed);
  };

  return (
    <div className={classNames(styles.pageBlock, collapsed && styles.deck)}>
      <section
        className={classNames(styles.page, collapsed && styles.pageDeck)}
        aria-labelledby={titleId}
      >
        <div
          className={classNames(
            rowStyles.header,
            styles.pageHeader,
            !collapsed && styles.pageHeaderOpen
          )}
        >
          <div className={rowStyles.summary}>
            <Typography
              variant="body3"
              component="h2"
              id={titleId}
              className={rowStyles.title}
            >
              {pageTitle}
            </Typography>
            <span className={rowStyles.dot} aria-hidden />
            <Typography
              variant="body3"
              component="span"
              className={rowStyles.detail}
            >
              {pluralize(questionCount, 'question')}
            </Typography>
          </div>
          <div className={rowStyles.actions}>
            {collapsed && hasUnsavedQuestion && (
              <UnsavedBadge label="Page contains an unsaved question" />
            )}
            <IconButton
              ref={toggleRef}
              aria-label={
                collapsed ? `Expand ${pageTitle}` : `Collapse ${pageTitle}`
              }
              aria-expanded={!collapsed}
              aria-controls={bodyId}
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
          id={bodyId}
          className={styles.pageBody}
          hidden={collapsed}
        >
          {questionCount === 0 ? (
            <div className={styles.emptyPage}>
              <div className={styles.emptyPageCopy}>
                <Typography
                  variant="body3"
                  component="p"
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
            <>
              <ol className={styles.questionList}>{children}</ol>
              <div className={styles.addQuestionRow}>
                <CreateQuestionDropdown
                  name={`create-question-page-${page}`}
                  variant="text"
                  onCreate={onCreate}
                  disabledReason={createDisabledReason}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default QuizPageBlock;
