import {Typography} from '@mui/material';
import {useEffect, useRef} from 'react';

import Alert from '@code-dot-org/component-library/alert';
import type {FontAwesomeV6IconProps} from '@code-dot-org/component-library/fontAwesomeV6Icon';

import styles from './console.module.css';
import {
  useDebug,
  type ConsoleEntry,
  type ConsoleLogLevel,
} from './DebugContext';
import {EmptyPanelPlaceholder} from './EmptyPanelPlaceholder';

// The console pane: what the student's page logged, newest last. Ported from
// apps/src/weblab2/debugPanel/Console.tsx, with the keyboard model reworked —
// see the note above the container div for why.
//
// Each log is an Alert coloured by level, carrying its own accessible name
// (level, message, timestamp, repeat count) via aria-label; the visible text
// is aria-hidden so it isn't announced twice.

// Icons are aria-hidden so a screen reader reads the Alert's aria-label rather
// than announcing the icon separately.
const LEVEL_ICONS: Partial<Record<ConsoleLogLevel, FontAwesomeV6IconProps>> = {
  warn: {iconName: 'exclamation-circle', 'aria-hidden': true},
  error: {iconName: 'circle-xmark', 'aria-hidden': true},
  info: {iconName: 'circle-info', 'aria-hidden': true},
};

const ALERT_TYPE = {
  log: 'gray',
  warn: 'warning',
  error: 'danger',
  info: 'info',
} as const satisfies Record<ConsoleLogLevel, string>;

/** What a screen reader reads for one log. Exported for testing. */
export function describeLog(log: ConsoleEntry, position: string): string {
  const repeats = log.count > 1 ? `, repeated ${log.count} times` : '';
  return `${position}${log.level}: ${log.message}, ${log.timestamp}${repeats}`;
}

export function positionOf(isFirst: boolean, isLast: boolean): string {
  if (isFirst && isLast) {
    return 'The only log entry. ';
  }
  if (isFirst) {
    return 'Oldest log entry. ';
  }
  return isLast ? 'Most recent log entry. ' : '';
}

export const Console = () => {
  const {logs} = useDebug();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Follow the tail as the page logs, the way a terminal does.
  useEffect(() => {
    const timeout = setTimeout(
      () => bottomRef.current?.scrollIntoView({behavior: 'smooth'}),
      50,
    );
    return () => clearTimeout(timeout);
  }, [logs]);

  if (logs.length === 0) {
    return (
      <EmptyPanelPlaceholder
        iconName="terminal"
        title="No console output"
        description="Add console.log() statements to your code to see output here."
      />
    );
  }

  return (
    // Legacy (apps/src/weblab2/debugPanel/Console.tsx) makes the whole list one
    // tab stop and requires pressing Enter to enter a roving-tabindex mode
    // over individual logs (Tab wraps, Escape exits) so a chatty page's
    // hundreds of logs don't become hundreds of tab stops. That composite
    // widget never had a role, so jsx-a11y's noninteractive-element rules
    // (rightly) reject it here.
    //
    // This is a plain readable/scrollable region, not a widget, so instead of
    // giving it a role it doesn't have we drop the Enter/Tab/Escape choreography
    // and keep the part that's actually required: a scrollable container that
    // isn't otherwise reachable needs to be keyboard-focusable so arrow/Page
    // keys can scroll it (WCAG 2.2 SC 2.1.1, matching the existing convention
    // in apps/src/lab2/.../InstructionsV2.tsx). No entry is individually
    // focusable, so the log never grows extra tab stops; a screen reader's
    // browse/virtual cursor still reads every entry via its aria-label.
    // Each Alert already renders role="alert" (or "status"), which is itself a
    // live region — nesting another live region around it would risk double
    // announcements, so the container stays a plain labelled region.
    <div
      className={styles.consoleContainer}
      role="region"
      aria-label="Console output"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region requires keyboard access per WCAG 2.2 SC 2.1.1
      tabIndex={0}
    >
      {logs.map((log, index) => {
        const isFirst = index === 0;
        const isLast = index === logs.length - 1;
        const label = describeLog(log, positionOf(isFirst, isLast));
        return (
          <Alert
            key={log.groupKey}
            type={ALERT_TYPE[log.level]}
            icon={LEVEL_ICONS[log.level]}
            size="s"
            className={styles.consoleLog}
            aria-label={label}
            text={
              <span aria-hidden="true">
                <div className={styles.consoleLogEntry}>
                  <Typography
                    variant="body3"
                    gutterBottom
                    className={styles.consoleLogMessage}
                  >
                    {log.message}
                  </Typography>
                  <div className={styles.logMeta}>
                    {log.count > 1 && (
                      <Typography
                        variant="body4"
                        gutterBottom
                        className={styles.countBadge}
                      >
                        Count: {log.count}
                      </Typography>
                    )}
                    <Typography
                      variant="body4"
                      gutterBottom
                      className={styles.timestamp}
                    >
                      {log.timestamp}
                    </Typography>
                  </div>
                </div>
              </span>
            }
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};
