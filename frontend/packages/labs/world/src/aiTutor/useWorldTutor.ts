// World Lab's AI Tutor, assembled.
//
// READ-ONLY, deliberately, where Web Lab's can rewrite files. Web Lab's project
// is HTML and CSS: a model can write a whole file and the lab can apply it. A
// world project is Blockly workspaces, and a model asked to produce one would
// be asked to emit block ids, coordinates, nested input maps and matching
// field types by hand. It would sometimes succeed, and the failures would land
// as a `.actor` that no longer opens — the student's work, gone, with an Accept
// button next to it.
//
// So `proposals` is omitted, which `@code-dot-org/aitutor` reads as "never
// offer to change anything" (specs/PLAN.md §8): every answer is prose. The
// tutor explains the game; the student moves the blocks.
//
// What it CAN do well is read. The generated code is a faithful, complete
// description of the behaviour, and the console is where a running game says
// what went wrong — which together is most of what a stuck learner needs.

import {useMemo, useRef} from 'react';

import {
  disabledStateFor,
  promptsFor,
  shouldShowAiTutor,
  type AiChatAccessLevel,
  type TutorConfig,
} from '@code-dot-org/aitutor';
import {
  DashboardApiClient,
  useCurrentUser,
  type MultiFileSource,
} from '@code-dot-org/core/api';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';
import {useAppSelector} from '@code-dot-org/lab/redux';

import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import {WORLD_SYSTEM_PROMPT, worldContext} from './context';
import {tutorTransport} from './transport';

/** The app name the access rules and the server know this lab by. */
const APP_NAME = 'world';

/** How much console history to send, as the shared context helper documents. */
const MAX_CONSOLE_LINES = 50;

export const useWorldTutor = (): TutorConfig | undefined => {
  const levelProperties = useMaybeLevelProperties();
  const {currentSources} = useSources<MultiFileSource>();
  const {consoleLog, hasCompiled, generatedProject} = useWorldRuntime();

  const {data: currentUser} = useCurrentUser(DashboardApiClient);
  const user = currentUser?.isSignedIn ? currentUser : undefined;
  const userAccessLevel =
    typeof user?.aiChatAccessLevel === 'string'
      ? (user.aiChatAccessLevel as AiChatAccessLevel)
      : undefined;

  const channelId = useAppSelector(state => state.lab.channel?.id);
  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  const scriptId = useAppSelector(state => state.lab.scriptId);
  const hasEdited = useAppSelector(state => state.labProject.hasEdited);

  // Read through refs: the context callback is built once and called per turn,
  // long after the render that made it.
  const sources = useRef(currentSources);
  sources.current = currentSources;
  const console_ = useRef(consoleLog);
  console_.current = consoleLog;

  const visible = shouldShowAiTutor({
    appName: APP_NAME,
    isTutorLevel: levelProperties?.aiTutorAvailable,
    aiChatAccessLevel: userAccessLevel,
  });

  const transport = useMemo(tutorTransport, []);

  return useMemo(() => {
    if (!visible) {
      return undefined;
    }

    return {
      transport,
      session: {clientType: 'ai-tutor', levelId, scriptId, channelId},
      systemPrompt: WORLD_SYSTEM_PROMPT,
      context: () => {
        const source = sources.current?.source as MultiFileSource | undefined;
        const files = Object.fromEntries(
          Object.values(source?.files ?? {}).map(file => [
            file.name,
            file.contents,
          ]),
        );
        return worldContext({
          // The same transform the compiler runs, so what the tutor reads and
          // what the game does cannot disagree.
          generated: generatedProject(files),
          longInstructions: levelProperties?.longInstructions,
          consoleOutput: console_.current
            .slice(-MAX_CONSOLE_LINES)
            .map(line => line.text)
            .join('\n'),
          hasRun: hasCompiled,
          hasEdited,
        });
      },
      prompts: promptsFor(scriptId ? 'level' : 'project'),
      disabledState: disabledStateFor({
        appName: APP_NAME,
        userAccessLevel,
        isTeacher: user?.userType === 'teacher',
        isLevelbuilder: user?.isLevelbuilder,
      }),
    };
  }, [
    visible,
    transport,
    levelId,
    scriptId,
    channelId,
    levelProperties?.longInstructions,
    generatedProject,
    hasCompiled,
    hasEdited,
    userAccessLevel,
    user?.userType,
    user?.isLevelbuilder,
  ]);
};
