import {Tooltip} from '@mui/material';
import classNames from 'classnames';
import {FunctionComponent, MouseEvent, ReactNode} from 'react';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './progressWidget.module.scss';

export type ProgressWidgetSaveStatus =
  | 'saved'
  | 'saving'
  | 'failed'
  | 'offline'
  | 'none';

export interface ProgressWidgetProps {
  /** Lesson name on the lesson menu button, e.g. "Lesson 3: Online Puzzles". */
  lessonLabel: string;
  /** Opens the lesson menu. */
  onLessonClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  lessonMenuExpanded?: boolean;
  /** 'none' hides the icon, for levels with no project. */
  saveStatus?: ProgressWidgetSaveStatus;
  /** Names the save icon and shows on hover and focus, e.g. "Saved 6 days ago". */
  saveStatusLabel?: string;
  /** The bubble row. The bubble with aria-current stays visible on narrow screens. */
  children: ReactNode;
  /** The Continue button. */
  action?: ReactNode;
  className?: string;
}

const saveIconName: Record<
  Exclude<ProgressWidgetSaveStatus, 'none'>,
  string
> = {
  saved: 'cloud-check',
  saving: 'spinner',
  failed: 'cloud-exclamation',
  offline: 'cloud-slash',
};

/**
 * ### Production-ready Checklist:
 * * (✘) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✔) has tests: test every prop, every state and every interaction that's js related;
 * * (see ./__tests__/ProgressWidget.test.tsx)
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```WIP```
 *
 * Design System: Progress Widget.
 * The lesson menu button, the save status, the lesson's progress bubbles and
 * the Continue button, as one group in the site header.
 */
const ProgressWidget: FunctionComponent<ProgressWidgetProps> = ({
  lessonLabel,
  onLessonClick,
  lessonMenuExpanded,
  saveStatus = 'none',
  saveStatusLabel,
  children,
  action,
  className,
}) => (
  <div className={classNames(moduleStyles.widget, className)}>
    <div className={moduleStyles.lesson}>
      <button
        type="button"
        className={moduleStyles.lessonButton}
        onClick={onLessonClick}
        aria-expanded={lessonMenuExpanded}
      >
        <span className={moduleStyles.lessonLabel}>{lessonLabel}</span>
        <FontAwesomeV6Icon
          iconName="chevron-down"
          iconStyle="solid"
          className={moduleStyles.chevron}
        />
      </button>
      {saveStatus !== 'none' && (
        <Tooltip title={saveStatusLabel} placement="bottom">
          <span
            className={moduleStyles.saveStatus}
            role="img"
            aria-label={saveStatusLabel}
          >
            <FontAwesomeV6Icon
              iconName={saveIconName[saveStatus]}
              iconStyle="solid"
              animationType={saveStatus === 'saving' ? 'spin' : undefined}
            />
          </span>
        </Tooltip>
      )}
    </div>
    <div className={moduleStyles.bubbles}>{children}</div>
    {action && <div className={moduleStyles.action}>{action}</div>}
  </div>
);

export default ProgressWidget;
