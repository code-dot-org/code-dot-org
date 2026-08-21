// Web Lab's AI Tutor, assembled.
//
// The lab's side of everything `@code-dot-org/aitutor` asks a host for: which
// transport answers, what the model is told about the project, which prompts to
// offer, whether the student may use it at all, and what to do with a set of
// rewritten files.
//
// WEB LAB IS THE TUTOR'S HOME LAB. `weblab2` is the one app name in
// `APPS_WHERE_AI_TUTOR_IS_ESSENTIAL`, so the tab is always there — a teacher who
// disables AI chat gets a tab that says why rather than no tab (see
// `disabledStateFor`) — and the accept/reject flow in the package was written
// against this lab's answer types.
//
// Returns `undefined` when the tutor should not be here at all, which is what
// `ResourcePanel` reads as "no tab".

import {useMemo, useRef} from 'react';

import {
  disabledStateFor,
  shouldShowAiTutor,
  answerSchema,
  promptsFor,
  type TutorConfig,
} from '@code-dot-org/aitutor';
import {useAppSelector} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useMaybeLevelProperties, useSources} from '@code-dot-org/lab/contexts';
import {predictLevelActions} from '@code-dot-org/lab/redux';
import {selectedSectionSelector} from '@code-dot-org/teacher-dashboard/redux';

import {webLabContext} from './context';
import {mergeProposedFiles} from './proposals';
import {tutorTransport} from './transport';

/** The app name the access rules and the server know this lab by. */
const APP_NAME = 'weblab2';

/**
 * The kinds of answer this lab asks the model for.
 *
 * From `AI_TUTOR_ANSWER_TYPES` in `apps/src/weblab2/types.ts`. The four `build`
 * kinds are the ones that mean "I have rewritten your files"; the rest are
 * answers to read.
 */
const ANSWER_TYPES = [
  'ask',
  'buildCSS',
  'buildHTML',
  'buildJavaScript',
  'buildJSON',
  'debug',
  'documentation',
  'example',
  'explainCode',
  'hint',
  'pseudocode',
  'refusal',
  'refusalJavaScriptSnippets',
  'testCase',
] as const;

const REWRITE_TYPES = ['buildHTML', 'buildCSS', 'buildJavaScript', 'buildJSON'];

/** What a Web Lab project is made of, and so what a proposal may touch. */
const FILE_TYPES = ['html', 'css', 'js', 'json'];

/** Web Lab's half of the answer schema — how it describes its own code. */
const CODE_DESCRIPTION =
  '`text`, `html`, `css`, `js` or `json` fences. Limit to one language ' +
  '(text, html, css, js, or json) across the entire list. The list can be ' +
  'empty. When providing modifications to a file in the student code, ' +
  'provide the entire contents of the file. Code should be formatted with ' +
  'appropriate newlines and indentation.';

export const useWebLabTutor = (): TutorConfig | undefined => {
  const levelProperties = useMaybeLevelProperties();
  const {currentSources, updateSources} = useSources<MultiFileSource>();

  const userAccessLevel = useAppSelector(
    state => state.currentUser.aiChatAccessLevel,
  );
  const isTeacher = useAppSelector(state => state.currentUser.isTeacher);
  const isLevelbuilder = useAppSelector(
    state => state.currentUser.isLevelbuilder,
  );
  const sectionAccessLevel = useAppSelector(
    state => selectedSectionSelector(state)?.aiChatAccessLevel,
  );
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel,
  );
  const hasSubmittedPredictResponse = useAppSelector(
    predictLevelActions.isPredictResponseSubmitted,
  );
  const hasRun = useAppSelector(state => state.labSystem.hasRun);
  const hasEdited = useAppSelector(state => state.labProject.hasEdited);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const levelId = useAppSelector(state => state.lab.levelProperties?.id);
  const scriptId = useAppSelector(state => state.lab.scriptId);

  // The project as it was before the tutor touched it, so Reject can put it
  // back. Held in a ref rather than in state because nothing renders from it,
  // and because it must be captured at the moment the proposal lands — by the
  // time either button is pressed, `currentSources` is the MERGED project.
  const beforeProposal = useRef<MultiFileSource | undefined>(undefined);

  // Read through a ref for the same reason: the callbacks below outlive the
  // render that made them.
  const sources = useRef(currentSources);
  sources.current = currentSources;

  const visible = shouldShowAiTutor({
    appName: APP_NAME,
    isTutorLevel: levelProperties?.aiTutorAvailable,
    aiChatAccessLevel: userAccessLevel,
  });

  const schema = useMemo(
    () =>
      answerSchema({
        answerTypes: ANSWER_TYPES,
        codeDescription: CODE_DESCRIPTION,
      }),
    [],
  );

  const transport = useMemo(tutorTransport, []);

  return useMemo(() => {
    if (!visible) {
      return undefined;
    }

    return {
      transport,
      session: {
        clientType: 'ai-tutor',
        levelId,
        scriptId,
        channelId,
      },
      context: () =>
        webLabContext({
          source: sources.current?.source as MultiFileSource | undefined,
          longInstructions: levelProperties?.longInstructions,
          hasRun,
          hasEdited,
        }),
      // A level has instructions to hint about; a project the student started
      // themselves does not.
      prompts: promptsFor(scriptId ? 'level' : 'project'),
      responseSchema: schema,
      disabledState: disabledStateFor({
        appName: APP_NAME,
        userAccessLevel,
        sectionAccessLevel,
        isTeacher,
        isLevelbuilder,
        isPredictLevel: Boolean(isPredictLevel),
        hasSubmittedPredictResponse,
      }),
      proposals: {
        answerTypes: REWRITE_TYPES,
        fileTypes: FILE_TYPES,
        onPropose: proposal => {
          const held = sources.current;
          const before = held?.source as MultiFileSource | undefined;
          if (!held || !before) {
            return;
          }
          beforeProposal.current = before;
          const {source} = mergeProposedFiles(before, proposal.files);
          // Applied so the student can SEE the change before answering, which
          // is what makes Accept and Reject a decision rather than a guess.
          updateSources({...held, source});
        },
        onAccept: () => {
          // The merged project is already what the editor holds and what the
          // autosave will write. Nothing to do but forget the way back.
          beforeProposal.current = undefined;
        },
        onReject: () => {
          const back = beforeProposal.current;
          const held = sources.current;
          beforeProposal.current = undefined;
          if (back && held) {
            updateSources({...held, source: back});
          }
        },
      },
    };
  }, [
    visible,
    transport,
    levelId,
    scriptId,
    channelId,
    levelProperties?.longInstructions,
    hasRun,
    hasEdited,
    schema,
    userAccessLevel,
    sectionAccessLevel,
    isTeacher,
    isLevelbuilder,
    isPredictLevel,
    hasSubmittedPredictResponse,
    updateSources,
  ]);
};
