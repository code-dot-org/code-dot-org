// World Lab's AI Tutor, assembled.
//
// IT MAY WRITE, but only what it can be proved will open. Web Lab's files are
// HTML and CSS: a model writes a whole file and the lab applies it, and a wrong
// stylesheet is visibly wrong and undoable. A world project is Blockly
// workspaces, and a model producing one is emitting block ids, nested input
// maps and matching field types by hand. It sometimes succeeds, and a failure
// lands as a `.actor` that no longer opens — the student's work, gone, with an
// Accept button next to it.
//
// So the offer is gated on GENERATING the proposed workspace first
// (`proposals.accepts`), which is the same call the compiler makes: a file that
// passes is a file that opens. One that does not becomes an explanation, which
// costs the student a paragraph rather than their project.
//
// A refusal now says why, in the browser console. It used to be silent, and a
// silent downgrade is indistinguishable from a bug — the student sees the
// workspace printed in the chat with no Accept button either way.

import {useMemo, useRef} from 'react';

import {
  answerSchema,
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

import {projectRuleMetas} from '../blockly/projectModules';
import {resolveRuleContents} from '../rules/ruleReference';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import {WORLD_SYSTEM_PROMPT, worldContext} from './context';
import {
  PROPOSABLE_TYPES,
  proposedProject,
  workspacesGenerate,
} from './proposals';
import {tutorTransport} from './transport';

/** The app name the access rules and the server know this lab by. */
const APP_NAME = 'world';

/** How much console history to send, as the shared context helper documents. */
const MAX_CONSOLE_LINES = 50;

/**
 * The kinds of answer this lab asks the model for.
 *
 * The three `build` kinds are the ones that mean "I have written you a
 * workspace"; the rest are answers to read.
 */
const ANSWER_TYPES = [
  'ask',
  'hint',
  'debug',
  'example',
  'explainCode',
  'buildActor',
  'buildWorld',
  'buildRule',
  'refusal',
] as const;

const REWRITE_TYPES = ['buildActor', 'buildWorld', 'buildRule'];

/** What the model is told to put in `code`, which here is not code. */
const CODE_DESCRIPTION =
  'Whole Blockly workspace files, as JSON. `filename` is the file to write ' +
  '(`actors/player.actor`, `rules/lava.rule`) and `sourceCode` is the entire ' +
  'workspace in the same shape you were shown — never a fragment, never a ' +
  'diff. Use only block types from the catalogue. The list may be empty when ' +
  'you are only explaining something.';

export const useWorldTutor = (): TutorConfig | undefined => {
  const levelProperties = useMaybeLevelProperties();
  const {currentSources, replaceSources, createCommit} =
    useSources<MultiFileSource>();
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

  const schema = useMemo(
    () =>
      answerSchema({
        answerTypes: ANSWER_TYPES,
        codeDescription: CODE_DESCRIPTION,
      }),
    [],
  );

  // The project as it was before the agent touched it, so Reject can put it
  // back. Captured when the offer lands, because by the time either button is
  // pressed the sources are the merged ones.
  const beforeProposal = useRef<MultiFileSource | undefined>(undefined);

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
        // Resolved, the way `projectFiles` resolves for everything else: the
        // rules below are parsed out of this map, and a reference parses to
        // nothing — the tutor would lose the project's entire rule vocabulary
        // and the block catalogue built from it. It costs the prompt nothing,
        // because a rule is never sent whole (`SENT_WHOLE`); what is sent is
        // the summary and the catalogue, both of which need the rule read.
        const files = Object.fromEntries(
          Object.values(source?.files ?? {}).map(file => [
            file.name,
            resolveRuleContents(file.contents),
          ]),
        );
        return worldContext({
          files,
          // The rules as the editor builds them for its own palette, so the
          // tutor's vocabulary and the student's are the same list.
          rules: projectRuleMetas(files),
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
      responseSchema: schema,
      proposals: {
        answerTypes: REWRITE_TYPES,
        fileTypes: [...PROPOSABLE_TYPES],
        // The gate. The project the offer WOULD produce is generated first —
        // rules it implies included — and the generator throws for anything
        // the editor could not open, so a bad answer becomes an explanation
        // rather than an Accept button over a file that will not load
        // (`aiTutor/proposals`).
        accepts: files => {
          const before = sources.current?.source as MultiFileSource | undefined;
          if (!before) {
            // Nothing to judge the offer against. Said out loud because a
            // silent `false` here is indistinguishable from a refusal, and
            // every silent path in this chain has cost a day.
            console.warn(
              'AI Tutor: refusing a change because the project is not loaded.',
            );
            return false;
          }
          return workspacesGenerate(before, files, generatedProject);
        },
        onPropose: proposal => {
          const held = sources.current;
          const before = held?.source as MultiFileSource | undefined;
          if (!held || !before) {
            return;
          }
          beforeProposal.current = before;
          // The same call the check made, so what is applied is what passed.
          // Rejecting puts back `before`, which is the project WITHOUT the
          // imported rules as well as without the workspaces — an offer
          // turned down should leave nothing of itself behind.
          const {source} = proposedProject(before, proposal.files);
          // Applied so the student can OPEN the changed actor and look at the
          // blocks before answering. That is the whole difference between a
          // decision and a guess here: the diff is visual.
          //
          // REPLACED, not updated. `updateSources` is for an edit the student
          // made, and an editor does not re-seed from its own typing — so a
          // file already open went on showing its old blocks, and the next
          // keystroke in that stale workspace wrote them back over the change.
          replaceSources({...held, source});
        },
        onAccept: (_, description) => {
          beforeProposal.current = undefined;
          // A NAMED VERSION, which is what the second step of Accept was
          // asking for. The student typed it into a field that until now
          // threw it away — worse than not asking, because it promised
          // something to come back to and made nothing.
          //
          // Not awaited: the decision is already made and the project already
          // holds the change. A commit that fails should say so in the console
          // and leave the student's work where it is, not block the button.
          void createCommit(description).catch((error: unknown) => {
            console.warn(
              'AI Tutor: the change was kept, but naming a version for it ' +
                'failed. It is saved as an ordinary edit.',
              error,
            );
          });
        },
        onReject: () => {
          const back = beforeProposal.current;
          const held = sources.current;
          beforeProposal.current = undefined;
          if (back && held) {
            // Replaced for the same reason: taking the change back is another
            // thing that happens to an open file from outside it.
            replaceSources({...held, source: back});
          }
        },
      },
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
    schema,
    replaceSources,
    createCommit,
    hasCompiled,
    hasEdited,
    userAccessLevel,
    user?.userType,
    user?.isLevelbuilder,
  ]);
};
