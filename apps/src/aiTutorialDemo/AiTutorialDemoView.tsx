import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Button as MuiButton,
  IconButton as MuiIconButton,
  Typography as MuiTypography,
} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {ActiveWidget, TutorSession, TutorSnapshot} from './agent/TutorSession';
import ChatPanel from './chat/ChatPanel';
import {McpActivityEntry, McpHostRuntime} from './mcp/hostRuntime';
import {createChartServer} from './mcp/servers/chartServer';
import {createChoiceServer} from './mcp/servers/choiceServer';
import {createCodeServer} from './mcp/servers/codeServer';
import {createInstructionsServer} from './mcp/servers/instructionsServer';
import WidgetFrame from './mcp/widgetHost/WidgetFrame';

import moduleStyles from './ai-tutorial-demo.module.scss';

// The grade selector lives inside the instructions widget (the plugin owns
// it); this is only what the tutor is told at session start, before any
// selection. Matches the widget's default.
const DEFAULT_GRADE = 'grade 5';

/**
 * Demo page: an AI tutor chat on the left drives MCP App widgets on the
 * right — a persistent instructions strip up top plus one activity widget.
 * The widget servers run in-page over an in-memory transport, but the host
 * talks to them only through MCP (tools/list, resources/read, tools/call),
 * so any of them could move behind a remote URL — including a third
 * party's — without the page changing.
 */
const AiTutorialDemoView: React.FunctionComponent = () => {
  const [snapshot, setSnapshot] = useState<TutorSnapshot>({
    items: [],
    busy: false,
    stageWidget: null,
    instructionsWidget: null,
  });
  const [activity, setActivity] = useState<McpActivityEntry[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const [instructionsHidden, setInstructionsHidden] = useState(false);
  const runtimeRef = useRef<McpHostRuntime | null>(null);
  const sessionRef = useRef<TutorSession | null>(null);
  // Items count at collapse time, for the unread badge on the rail.
  const collapsedAtCountRef = useRef(0);
  const activityLogRef = useRef<HTMLPreElement>(null);

  // Keep the activity log pinned to the newest entry, same as the chat
  // list. While <details> is closed the pre has no layout, so the log is
  // also pinned when it's opened (see onToggle below).
  const pinActivityLog = () => {
    const node = activityLogRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  };
  useEffect(pinActivityLog, [activity]);

  // New panel content (each call bumps callId) reveals hidden instructions:
  // a hidden correction is a correction the student never sees.
  const instructionsCallId = snapshot.instructionsWidget?.callId;
  useEffect(() => {
    if (instructionsCallId !== undefined) {
      setInstructionsHidden(false);
    }
  }, [instructionsCallId]);

  useEffect(() => {
    // The AI gateway's access-token endpoint requires an aichat context.
    // Like the levelbuilder generator pages, this page has no level or
    // channel; lesson-deep-dive is the client type trusted for any
    // signed-in user.
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.LESSON_DEEP_DIVE,
      currentLevelId: null,
      scriptId: null,
      channelId: undefined,
    });

    let cancelled = false;
    (async () => {
      try {
        const runtime = await McpHostRuntime.create(
          [
            {name: 'instructions-server', create: createInstructionsServer},
            {name: 'chart-server', create: createChartServer},
            {name: 'choice-server', create: createChoiceServer},
            {name: 'code-exercise-server', create: createCodeServer},
          ],
          entry => setActivity(previous => [...previous, entry])
        );
        if (cancelled) {
          return;
        }
        runtimeRef.current = runtime;
        const session = new TutorSession(runtime, setSnapshot, DEFAULT_GRADE);
        sessionRef.current = session;
        session.start();
      } catch (error) {
        console.error('AI tutorial demo failed to initialize:', error);
        setInitError(String(error));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // tools/call arriving from a widget iframe. Per the MCP Apps visibility
  // rules, views may only call tools marked app-visible.
  const handleToolCall = useCallback(
    (name: string, args: Record<string, unknown>) => {
      const tool = runtimeRef.current?.getTool(name);
      if (!tool?.visibility.includes('app')) {
        return Promise.reject(
          new Error(`Tool ${name} is not callable from widgets`)
        );
      }
      return runtimeRef.current!.callTool(name, args);
    },
    []
  );

  const widgetFrameFor = (
    widget: ActiveWidget,
    frameKey: React.Key,
    minHeight?: number,
    maxHeight?: number
  ) => (
    <WidgetFrame
      key={frameKey}
      html={widget.html}
      toolName={widget.toolName}
      toolInput={widget.toolInput}
      toolResult={widget.toolResult}
      onToolCall={handleToolCall}
      onModelContextUpdate={update =>
        sessionRef.current?.notifyWidgetEvent(update)
      }
      onUserMessage={text => sessionRef.current?.sendStudentMessage(text)}
      minHeight={minHeight}
      maxHeight={maxHeight}
    />
  );

  const {stageWidget, instructionsWidget} = snapshot;
  const unreadCount = chatCollapsed
    ? snapshot.items.filter(
        (item, index) =>
          index >= collapsedAtCountRef.current &&
          item.kind === 'message' &&
          item.role === 'assistant'
      ).length
    : 0;

  return (
    <div className={moduleStyles.page}>
      <div className={moduleStyles.header}>
        <div>
          <MuiTypography variant="h1" className={moduleStyles.title}>
            AI Tutorial Demo
          </MuiTypography>
          <MuiTypography variant="body3" className={moduleStyles.subtitle}>
            An AI tutor drives interactive widgets over MCP. Lesson: averages.
          </MuiTypography>
        </div>
      </div>
      <div className={moduleStyles.columns}>
        {chatCollapsed ? (
          <div className={moduleStyles.chatRail}>
            <MuiIconButton
              aria-label="Expand chat"
              onClick={() => setChatCollapsed(false)}
            >
              <FontAwesomeV6Icon iconName="comment" />
            </MuiIconButton>
            {unreadCount > 0 && (
              <span className={moduleStyles.unreadBadge}>{unreadCount}</span>
            )}
          </div>
        ) : (
          <div className={moduleStyles.chatColumn}>
            <div className={moduleStyles.chatToolbar}>
              <MuiIconButton
                aria-label="Collapse chat"
                size="small"
                onClick={() => {
                  collapsedAtCountRef.current = snapshot.items.length;
                  setChatCollapsed(true);
                }}
              >
                <FontAwesomeV6Icon iconName="angles-left" />
              </MuiIconButton>
            </div>
            <ChatPanel
              items={snapshot.items}
              busy={snapshot.busy}
              onSubmit={text => sessionRef.current?.sendStudentMessage(text)}
            />
          </div>
        )}
        <div className={moduleStyles.stageColumn}>
          {/* Pinned outside the scroll region so it can never clip; keyed
              stably so the view persists across set_instructions calls and
              keeps the student's grade selection. Hiding only hides the
              card — the iframe stays mounted for the same reason. */}
          {instructionsWidget && (
            <div
              className={moduleStyles.instructionsCard}
              hidden={instructionsHidden}
            >
              {widgetFrameFor(
                instructionsWidget,
                'instructions-view',
                48,
                // Instructions must always show everything; the show/hide
                // button is the escape hatch on small windows.
                Number.POSITIVE_INFINITY
              )}
            </div>
          )}
          <div className={moduleStyles.stageScroll}>
            {initError ? (
              <div className={moduleStyles.emptyStage}>
                Something went wrong loading the demo: {initError}
              </div>
            ) : stageWidget ? (
              <div className={moduleStyles.widgetCard}>
                {widgetFrameFor(stageWidget, stageWidget.callId)}
              </div>
            ) : (
              <div className={moduleStyles.emptyStage}>
                Your tutor will put activities here.
              </div>
            )}
            <details
              className={moduleStyles.activityLog}
              onToggle={pinActivityLog}
            >
              <summary>MCP activity ({activity.length})</summary>
              <pre ref={activityLogRef}>
                {activity
                  .map(
                    entry =>
                      `${new Date(entry.at).toLocaleTimeString()}  ${
                        entry.label
                      }` + (entry.detail ? `\n${entry.detail}` : '')
                  )
                  .join('\n\n')}
              </pre>
            </details>
          </div>
          {instructionsWidget && (
            <MuiButton
              variant="outlined"
              size="extraSmall"
              className={moduleStyles.instructionsToggle}
              onClick={() => setInstructionsHidden(hidden => !hidden)}
            >
              {instructionsHidden ? 'Show instructions' : 'Hide instructions'}
            </MuiButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiTutorialDemoView;
