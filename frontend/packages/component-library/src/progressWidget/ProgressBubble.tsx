import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import {FunctionComponent, MouseEvent, ReactNode} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './progressBubble.module.scss';

export type ProgressBubbleLevelType = 'default' | 'panelLevel' | 'lessonExtras';

export type ProgressBubbleStatus =
  | 'notStarted'
  | 'inProgress'
  | 'passed'
  | 'completed'
  | 'keepWorking'
  | 'error';

export interface ProgressBubbleProps {
  /** Circle for most levels, diamond for panel levels, a flag for lesson extras. */
  levelType?: ProgressBubbleLevelType;
  /** Ignored for lesson extras. */
  status?: ProgressBubbleStatus;
  /** The current level: drawn large, with its number. */
  isActive?: boolean;
  /** Adds a star mark. */
  isAssessment?: boolean;
  /** Shown only while active. */
  levelNumber?: number | string;
  disabled?: boolean;
  /** Renders the bubble as a link. */
  href?: string;
  /** Renders the bubble as a button, or runs before a link navigates. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Screen reader name, e.g. "Level 6, completed". */
  ariaLabel: string;
  tooltip?: ReactNode;
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✘) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/ProgressBubble.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Progress Bubble.
 * One level in a lesson's progress row, as drawn by the Progress Widget.
 */
const ProgressBubble: FunctionComponent<ProgressBubbleProps> = ({
  levelType = 'default',
  status = 'notStarted',
  isActive = false,
  isAssessment = false,
  levelNumber,
  disabled = false,
  href,
  onClick,
  ariaLabel,
  tooltip,
  className,
}) => {
  const isLessonExtras = levelType === 'lessonExtras';
  const classes = classNames(
    moduleStyles.bubble,
    moduleStyles[levelType],
    !isLessonExtras && moduleStyles[status],
    isActive && moduleStyles.active,
    disabled && moduleStyles.disabled,
    className,
  );

  const content = isLessonExtras ? (
    <FontAwesomeV6Icon
      iconName="flag-checkered"
      iconStyle="solid"
      className={moduleStyles.icon}
    />
  ) : (
    <>
      {isActive && <span className={moduleStyles.number}>{levelNumber}</span>}
      {isAssessment && (
        <span className={moduleStyles.assessment}>
          <FontAwesomeV6Icon iconName="star" iconStyle="solid" />
        </span>
      )}
    </>
  );

  const shared = {
    className: classes,
    'aria-label': ariaLabel,
    'aria-current': isActive ? ('step' as const) : undefined,
  };

  let bubble;
  if (disabled) {
    bubble = (
      <span {...shared} aria-disabled="true">
        {content}
      </span>
    );
  } else if (href) {
    bubble = (
      <a {...shared} href={href} onClick={onClick}>
        {content}
      </a>
    );
  } else if (onClick) {
    bubble = (
      <button {...shared} type="button" onClick={onClick}>
        {content}
      </button>
    );
  } else {
    bubble = (
      <span {...shared} role="img">
        {content}
      </span>
    );
  }

  return tooltip ? (
    <Tooltip title={tooltip} placement="bottom">
      {bubble}
    </Tooltip>
  ) : (
    bubble
  );
};

export default ProgressBubble;
