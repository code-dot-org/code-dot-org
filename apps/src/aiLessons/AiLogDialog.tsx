// Under-the-hood view of the AI traffic on this page, for demo users:
// one collapsed row per LLM interaction, tagged with the agent that made
// it, grouped by the step the student was on (aiLog records a marker row
// on every step arrival).  Expanding a row shows the request (user
// prompt over system prompt) beside the response, long texts truncated
// with click-to-expand.  Subscribes to the aiLog store, so in-flight
// calls update live.

import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {CustomDialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {useEffect, useRef, useState} from 'react';

import {AiLogCall, getAiLogRows, subscribeAiLog} from './aiLog';

import styles from './aiLessons.module.scss';

// Agent tags for the labels call sites pass to loggedGenerateText.
const AGENT_ICONS: {[label: string]: string} = {
  'build partner': 'wrench',
  'tutor opening': 'graduation-cap',
  'tutor reply': 'graduation-cap',
  'answer judge': 'scale-balanced',
  'branch judge': 'scale-balanced',
  'mastery evaluation': 'clipboard-check',
  'remediation generator': 'kit-medical',
  'arc generator': 'wand-magic-sparkles',
  'lesson generator': 'wand-magic-sparkles',
  'progress summary': 'file-lines',
  'step observation': 'eye',
  'panel image': 'image',
};

const TRUNCATE_AT = 600;

// A titled prompt/response block.  Long text truncates; the +/- next to
// the title expands and collapses it, and a Show more/less link at the
// bottom does the same so a long expanded block can be collapsed from
// where the reader ends up.
const LogSection: React.FunctionComponent<{
  title: string;
  text: string;
  isError?: boolean;
}> = ({title, text, isError}) => {
  const [expanded, setExpanded] = useState(false);
  const truncates = text.length > TRUNCATE_AT;
  return (
    <div>
      <div className={styles.aiLogFieldTitle}>
        <span>{title}</span>
        {truncates && (
          <button
            type="button"
            className={styles.aiLogCaret}
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            aria-label={
              expanded ? `Collapse ${title}` : `Expand ${title} (truncated)`
            }
            title={
              expanded
                ? 'Show less'
                : `Show all (${text.length.toLocaleString()} chars)`
            }
          >
            <FontAwesomeV6Icon
              iconName={expanded ? 'minus' : 'plus'}
              iconStyle="solid"
            />
          </button>
        )}
      </div>
      <pre
        className={`${styles.aiLogText}${
          isError ? ` ${styles.aiLogTextError}` : ''
        }`}
      >
        {expanded || !truncates ? text : `${text.slice(0, TRUNCATE_AT)}…`}
      </pre>
      {truncates && (
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setExpanded(v => !v)}
        >
          {expanded
            ? 'Show less'
            : `Show more (${text.length.toLocaleString()} chars)`}
        </button>
      )}
    </div>
  );
};

const StatusChip: React.FunctionComponent<{call: AiLogCall}> = ({call}) => {
  if (call.status === 'pending') {
    return (
      <span className={`${styles.aiLogStatus} ${styles.aiLogStatusPending}`}>
        <FontAwesomeV6Icon
          iconName="spinner"
          iconStyle="solid"
          animationType="spin"
        />
        in progress
      </span>
    );
  }
  const seconds = ((call.durationMs || 0) / 1000).toFixed(1);
  if (call.status === 'error') {
    return (
      <span className={`${styles.aiLogStatus} ${styles.aiLogStatusError}`}>
        <FontAwesomeV6Icon iconName="circle-xmark" iconStyle="solid" />
        failed · {seconds}s
      </span>
    );
  }
  return (
    <span className={`${styles.aiLogStatus} ${styles.aiLogStatusSuccess}`}>
      <FontAwesomeV6Icon iconName="circle-check" iconStyle="solid" />
      {seconds}s
    </span>
  );
};

const CallRow: React.FunctionComponent<{
  call: AiLogCall;
  expanded: boolean;
  // Accordion behavior: the dialog owns which single row is open.
  onToggle: () => void;
}> = ({call, expanded, onToggle}) => {
  return (
    <div className={styles.aiLogRow}>
      <button
        type="button"
        className={styles.aiLogRowHeader}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <FontAwesomeV6Icon
          iconName={expanded ? 'chevron-down' : 'chevron-right'}
          iconStyle="solid"
          className={styles.aiLogChevron}
        />
        <FontAwesomeV6Icon
          iconName={AGENT_ICONS[call.label] || 'robot'}
          iconStyle="solid"
          className={styles.aiLogAgentIcon}
        />
        <span className={styles.aiLogLabel}>{call.label}</span>
        <span className={styles.aiLogModel}>{call.model}</span>
        <StatusChip call={call} />
      </button>
      {expanded && (
        <div className={styles.aiLogDetail}>
          <div>
            <div className={styles.aiLogColumnTitle}>Request</div>
            {call.prompt && (
              <LogSection title="User prompt" text={call.prompt} />
            )}
            {call.system && (
              <LogSection title="System prompt" text={call.system} />
            )}
            {!call.prompt && !call.system && (
              <div className={styles.muted}>(no prompt text)</div>
            )}
          </div>
          <div>
            <div className={styles.aiLogColumnTitle}>Response</div>
            {call.status === 'pending' && (
              <div className={styles.muted}>Waiting for the model…</div>
            )}
            {call.status === 'error' && (
              <LogSection
                title="Error"
                text={call.error || 'Request failed'}
                isError
              />
            )}
            {call.status === 'success' &&
              (call.response ? (
                <LogSection title="Output" text={call.response} />
              ) : (
                <div className={styles.muted}>(empty response)</div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AiLogDialog: React.FunctionComponent<{onClose: () => void}> = ({
  onClose,
}) => {
  const {theme} = useTheme();
  const [logRows, setLogRows] = useState(getAiLogRows());
  // At most one call row open at a time.
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeAiLog(() => setLogRows(getAiLogRows())), []);

  // Open at the latest activity; the list is chronological.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  return (
    <CustomDialog
      mode={theme === 'Dark' ? 'dark' : 'light'}
      onClose={onClose}
      aria-label="AI Log"
      className={styles.aiLogDialog}
    >
      <h2 className={styles.demoSettingsTitle}>AI Log</h2>
      <p id="dsco-dialog-description" className={styles.muted}>
        Every AI request this page has made, newest last. Expand a row to see
        exactly what was sent and what came back.
      </p>
      <div className={styles.aiLogList} ref={scrollRef}>
        {logRows.length === 0 && (
          <div className={styles.muted}>No AI calls yet.</div>
        )}
        {logRows.map(row =>
          row.kind === 'step' ? (
            <div key={row.id} className={styles.aiLogStepMarker}>
              <FontAwesomeV6Icon iconName="shoe-prints" iconStyle="solid" />
              <span>{row.title}</span>
            </div>
          ) : (
            <CallRow
              key={row.id}
              call={row}
              expanded={expandedId === row.id}
              onToggle={() =>
                setExpandedId(current => (current === row.id ? null : row.id))
              }
            />
          )
        )}
      </div>
    </CustomDialog>
  );
};

export default AiLogDialog;
