import {Typography as MuiTypography} from '@mui/material';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {TutorSession, TutorSnapshot} from './agent/TutorSession';
import ChatPanel from './chat/ChatPanel';
import {McpActivityEntry, McpHostRuntime} from './mcp/hostRuntime';
import {createChartServer} from './mcp/servers/chartServer';
import {createChoiceServer} from './mcp/servers/choiceServer';
import {createCodeServer} from './mcp/servers/codeServer';
import WidgetFrame from './mcp/widgetHost/WidgetFrame';

import moduleStyles from './ai-tutorial-demo.module.scss';

/**
 * Demo page: an AI tutor chat on the left drives MCP App widgets on the
 * right. The three widget servers run in-page over an in-memory transport,
 * but the host talks to them only through MCP (tools/list, resources/read,
 * tools/call), so any of them could move behind a remote URL — including a
 * third party's — without the page changing.
 */
const AiTutorialDemoView: React.FunctionComponent = () => {
  const [snapshot, setSnapshot] = useState<TutorSnapshot>({
    items: [],
    busy: false,
    widget: null,
  });
  const [activity, setActivity] = useState<McpActivityEntry[]>([]);
  const [initError, setInitError] = useState<string | null>(null);
  const runtimeRef = useRef<McpHostRuntime | null>(null);
  const sessionRef = useRef<TutorSession | null>(null);

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
        const session = new TutorSession(runtime, setSnapshot);
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

  const {widget} = snapshot;

  return (
    <div className={moduleStyles.page}>
      <div className={moduleStyles.header}>
        <MuiTypography variant="h1" className={moduleStyles.title}>
          AI Tutorial Demo
        </MuiTypography>
        <MuiTypography variant="body3" className={moduleStyles.subtitle}>
          An AI tutor drives interactive widgets over MCP. Lesson: averages.
        </MuiTypography>
      </div>
      <div className={moduleStyles.columns}>
        <div className={moduleStyles.chatColumn}>
          <ChatPanel
            items={snapshot.items}
            busy={snapshot.busy}
            onSubmit={text => sessionRef.current?.sendStudentMessage(text)}
          />
        </div>
        <div className={moduleStyles.stageColumn}>
          {initError ? (
            <div className={moduleStyles.emptyStage}>
              Something went wrong loading the demo: {initError}
            </div>
          ) : widget ? (
            <div className={moduleStyles.widgetCard}>
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
                onUserMessage={text =>
                  sessionRef.current?.sendStudentMessage(text)
                }
              />
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
