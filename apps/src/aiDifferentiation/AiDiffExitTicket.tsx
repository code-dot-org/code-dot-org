import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useCallback, useState} from 'react';

import SafeMarkdown from '../templates/SafeMarkdown';

import {ExitTicket, ExitTicketItem} from './types';

import style from './ai-differentiation.module.scss';

interface AiDiffExitTicketProps {
  title: string;
  updated: Date;
  content: ExitTicket;
}

const AiDiffExitTicket: React.FC<AiDiffExitTicketProps> = ({
  title,
  updated,
  content,
}) => {
  const items = content.exit_ticket_items;
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapsed = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  const styledQuestion = (type: string, id: number, question: string) => {
    let iconName = 'ballot-check';
    let label = 'Question';
    let styleName = 'Blue';
    if (type === 'multiple_choice') {
      iconName = 'ballot-check';
      label = 'Multiple Choice';
      styleName = 'Blue';
    } else if (type === 'free_response') {
      iconName = 'pencil';
      label = 'Free Response';
      styleName = 'Red';
    } else if (
      type === 'short_answer' ||
      type === 'true_false' ||
      type === 'fill_in_the_blank'
    ) {
      iconName = 'comments-question-check';
      label = 'Short Answer';
      styleName = 'Purple';
    }

    return (
      <div className={style.artifactContentBlock}>
        <div
          className={classNames(
            style.artifactContentLabel,
            style[`artifactContentLabel${styleName}`]
          )}
        >
          <FontAwesomeV6Icon
            iconName={iconName}
            className={style.artifactIcon}
          />
          <Typography variant="overline1">{label}</Typography>
        </div>
        <div
          className={classNames(
            style.artifactContent,
            style[`artifactContent${styleName}`]
          )}
          key={id}
        >
          <Typography component="div" variant="body2" gutterBottom>
            <SafeMarkdown
              unwrapped
              markdown={`**Question ${id + 1}:** ${question}`}
            />
          </Typography>
        </div>
      </div>
    );
  };

  return (
    <div className={style.artifactContainer}>
      <div className={style.artifactHeader}>
        <Typography variant="h1">{title}</Typography>
        <Typography variant="overline1">
          {updated.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Typography>
      </div>
      <div className={style.artifactContentBlocksContainer}>
        {items.map((item: ExitTicketItem, id: number) =>
          styledQuestion(item.type, id, item.question)
        )}
        <div className={style.answerKeyContainer}>
          <div className={style.answerKeyHeader}>
            <Typography variant="h4" gutterBottom>
              {'Answer Key'}
            </Typography>
            <button
              type="button"
              onClick={toggleCollapsed}
              className={style.answerIcon}
            >
              <FontAwesomeV6Icon
                iconName={collapsed ? 'angle-down' : 'angle-up'}
                iconStyle="solid"
                className={style.answerIcon}
              />
            </button>
          </div>
          {!collapsed &&
            items.map((item: ExitTicketItem, id: number) => (
              <Typography component="div" variant="body2" gutterBottom>
                <SafeMarkdown
                  unwrapped
                  markdown={`**Question ${id + 1}:**\n${item.answer}`}
                />
              </Typography>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AiDiffExitTicket;
