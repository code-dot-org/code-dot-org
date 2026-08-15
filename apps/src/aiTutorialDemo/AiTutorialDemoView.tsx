import {SimpleDropdown} from '@code-dot-org/component-library/dropdown';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
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

const GRADE_ITEMS = [
  {value: 'grade 3', text: 'Grade 3'},
  {value: 'grade 4', text: 'Grade 4'},
  {value: 'grade 5', text: 'Grade 5'},
  {value: 'grade 6', text: 'Grade 6'},
  {value: 'grade 7', text: 'Grade 7'},
  {value: 'grade 8', text: 'Grade 8'},
  {value: 'high school', text: 'High school'},
];
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
  const [grade, setGrade] = useState(DEFAULT_GRADE);
  const [chatCollapsed, setChatCollapsed] = useState(false);
  const runtimeRef = useRef<McpHostRuntime | null>(null);
  const sessionRef = useRef<TutorSession | null>(null);
  const gradeRef = useRef(DEFAULT_GRADE);
  // Items count at collapse time, for the unread badge on the rail.
  const collapsedAtCountRef = useRef(0);

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
        const session = new TutorSession(
          runtime,
          setSnapshot,
          gradeRef.current
        );
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

  const handleToolCall = useCallback(
    (name: string, args: Record<string, unknown>) =>
      runtimeRef.current!.callTool(name, args),
    []
  );

  const widgetFrameFor = (widget: ActiveWidget, minHeight?: number) => (
    <WidgetFrame
      key={widget.callId}
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
        <SimpleDropdown
          name="grade-level"
          labelText="Grade level"
          isLabelVisible={false}
          size="s"
          items={GRADE_ITEMS}
          selectedValue={grade}
          onChange={event => {
            const value = event.target.value;
            setGrade(value);
            gradeRef.current = value;
            sessionRef.current?.setGradeLevel(value);
          }}
        />
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
          {instructionsWidget && (
            <div className={moduleStyles.instructionsCard}>
              {widgetFrameFor(instructionsWidget, 48)}
            </div>
          )}
          {initError ? (
            <div className={moduleStyles.emptyStage}>
              Something went wrong loading the demo: {initError}
            </div>
          ) : stageWidget ? (
            <div className={moduleStyles.widgetCard}>
              {widgetFrameFor(stageWidget)}
            </div>
          ) : (
            <div className={moduleStyles.emptyStage}>
              Your tutor will put activities here.
            </div>
          )}
          <details className={moduleStyles.activityLog}>
            <summary>MCP activity ({activity.length})</summary>
            <pre>
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
      </div>
    </div>
  );
};

export default AiTutorialDemoView;
