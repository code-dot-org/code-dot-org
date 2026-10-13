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
  /** Adds a star mark.  Circles only: panel levels are never assessments. */
  isAssessment?: boolean;
  /** Shown only while active. */
  levelNumber?: number | string;
  disabled?: boolean;
  /** Renders the bubble as a link. */
  href?: string;
  /** Renders the bubble as a button, or runs before a link navigates.  A
   *  handler that calls preventDefault on a link should first let modified
   *  clicks (open in new tab) through. */
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  /** Screen reader name.  Star and color are visual only, so it carries the
   *  status, e.g. "Level 6, completed". */
  ariaLabel: string;
  /** Read after the name unless it repeats it. */
  tooltip?: ReactNode;
  className?: string;
}

/**
 * ### Production-ready Checklist:
 * * (✘) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✘) has tests: test every prop, every state and every interaction that's js related;
 * *     (behavior and roles are tested; status colors are not asserted)
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
      {isAssessment && levelType === 'default' && (
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
    // The disabled-link pattern; focusable only when there is a tooltip to reach.
    bubble = (
      <span
        {...shared}
        role="link"
        aria-disabled="true"
        tabIndex={tooltip ? 0 : undefined}
      >
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
    <Tooltip
      title={tooltip}
      placement="bottom"
      describeChild={tooltip !== ariaLabel}
    >
      {bubble}
    </Tooltip>
  ) : (
    bubble
  );
};

export default ProgressBubble;
