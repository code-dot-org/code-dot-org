import {Box, Button, Tooltip} from '@mui/material';
import {visuallyHidden} from '@mui/utils';
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

/** 'none' hides the icon, for levels with no project; any other status needs a label. */
export type ProgressWidgetSaveProps =
  | {saveStatus?: 'none'; saveStatusLabel?: undefined}
  | {
      saveStatus: Exclude<ProgressWidgetSaveStatus, 'none'>;
      /** Names the save icon and shows on hover, e.g. "Saved 6 days ago". */
      saveStatusLabel: string;
    };

export type ProgressWidgetProps = {
  /** Lesson name on the lesson menu button, e.g. "Lesson 3: Online Puzzles". */
  lessonLabel: string;
  /** Opens the lesson menu. */
  onLessonClick: (e: MouseEvent<HTMLButtonElement>) => void;
  lessonMenuExpanded?: boolean;
  /** Names the bubble row for screen readers, e.g. "Lesson progress". */
  bubblesLabel: string;
  /** Bubbles as direct children; below 992px only the aria-current one shows. */
  children: ReactNode;
  /** The Continue button. */
  action?: ReactNode;
  className?: string;
} & ProgressWidgetSaveProps;

const saveIconName: Record<
  Exclude<ProgressWidgetSaveStatus, 'none'>,
  string
> = {
  saved: 'cloud-check',
  saving: 'spinner',
  failed: 'cloud-exclamation',
  offline: 'cloud-slash',
};

// Saving and saved repeat with every autosave; announce only what needs action.
const announcedSaveStatuses: ProgressWidgetSaveStatus[] = ['failed', 'offline'];

/**
 * ### Production-ready Checklist:
 * * (✘) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✘) has tests: test every prop, every state and every interaction that's js related;
 * *     (behavior and roles are tested; the narrow layout is not)
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
  lessonMenuExpanded = false,
  bubblesLabel,
  saveStatus = 'none',
  saveStatusLabel,
  children,
  action,
  className,
}) => (
  <div className={classNames(moduleStyles.widget, className)}>
    <div className={moduleStyles.lesson}>
      <Button
        variant="outlined"
        color="secondary"
        size="extraSmall"
        className={moduleStyles.lessonButton}
        onClick={onLessonClick}
        aria-expanded={lessonMenuExpanded}
        endIcon={
          <FontAwesomeV6Icon iconName="chevron-down" iconStyle="solid" />
        }
      >
        <span className={moduleStyles.lessonLabel}>{lessonLabel}</span>
      </Button>
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
      <Box component="span" role="status" sx={visuallyHidden}>
        {announcedSaveStatuses.includes(saveStatus) ? saveStatusLabel : ''}
      </Box>
    </div>
    <div
      className={moduleStyles.bubbles}
      role="group"
      aria-label={bubblesLabel}
    >
      {children}
    </div>
    {action && <div className={moduleStyles.action}>{action}</div>}
  </div>
);

export default ProgressWidget;
