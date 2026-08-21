// What the host tells the panel.
//
// Everything here is a thing only the host can know or do: which transport to
// talk to, what the project currently looks like, what to do with a set of
// proposed file edits. The panel reads this and nothing else about the world
// outside it, which is what lets the same panel run in studio, in a lab, and on
// a demo page with no server (specs/PLAN.md §4).
//
// A CONTEXT rather than a thunk's `extra` argument, because the store belongs to
// the host: `labs/base` builds it by injecting slices into the one store
// `@code-dot-org/core/redux` owns, and configuring that store's `extra` is not
// something a package may reach in and do. Injecting a slice is the only thing
// this package asks of a host.

import {
  createContext,
  useContext,
  useMemo,
  type FC,
  type ReactNode,
} from 'react';

import type {AiTutorContext} from '../context/types';
import type {SuggestedPrompt} from '../prompts/suggestedPrompts';
import type {ProposalPolicy, TutorProposal} from '../response/proposal';
import type {TutorSessionInfo, TutorTransport} from '../transport/types';

export interface TutorConfig {
  transport: TutorTransport;

  /** Facts about where this conversation is happening. */
  session?: TutorSessionInfo;

  /**
   * The project, as the model should see it.
   *
   * Called once per turn, not once per session, because the answer is about the
   * code as it is NOW. May be async: gathering it can mean asking an editor for
   * its current contents.
   *
   * Returns the FACTS, not the sentences. Turning them into a prompt is this
   * package's job (`context/hiddenContext`), for the reason the legacy helper
   * gives: the wording has been tuned against a model, and a lab that phrased
   * its own would be tuning against a different input from every other lab.
   */
  context?: () => AiTutorContext | Promise<AiTutorContext>;

  /**
   * The buttons above the composer.
   *
   * Which ones make sense depends on where the student is, and only the host
   * knows that — `promptsFor('level' | 'project')` builds the two sets the
   * legacy uses. Omitted means no buttons.
   */
  prompts?: readonly SuggestedPrompt[];

  systemPrompt?: string;

  /**
   * A JSON Schema, when this session wants files back rather than prose.
   *
   * Its presence is what turns a reply into a possible proposal.
   */
  responseSchema?: object;

  /**
   * What to do when the tutor rewrites some files.
   *
   * Omitted, the tutor never offers to change anything: every answer is shown
   * as prose for the student to copy across, which is the right default for a
   * host that has no way to apply an edit.
   *
   * The POLICY half is here because neither part of it can be guessed — which
   * answer types mean a rewrite depends on what the lab asked for, and which
   * file types can be applied depends on what a project in that lab is made
   * of. The CALLBACKS are here because the host decides what a file is, whether
   * the workspace goes read-only while the offer stands, and what accepting one
   * commits.
   */
  proposals?: ProposalPolicy & {
    /**
     * The tutor has rewritten some files. Apply them, provisionally.
     *
     * Legacy replaces the project sources here and makes the workspace
     * read-only until the student answers, so that Accept and Reject are a
     * decision about something they can see rather than a description.
     */
    onPropose?: (proposal: TutorProposal) => void;
    /** Keep them. `description` is what the student typed for the version. */
    onAccept?: (proposal: TutorProposal, description: string) => void;
    /** Put the project back. */
    onReject?: (proposal: TutorProposal) => void;
  };
}

const TutorContext = createContext<TutorConfig | undefined>(undefined);

export const TutorProvider: FC<TutorConfig & {children: ReactNode}> = ({
  children,
  ...config
}) => {
  // Rebuilt only when something in it actually changed, so a host that
  // re-renders with the same callbacks does not restart every consumer.
  const value = useMemo(
    () => config,
    [
      config.transport,
      config.session,
      config.context,
      config.prompts,
      config.systemPrompt,
      config.responseSchema,
      config.proposals,
    ],
  );
  return (
    <TutorContext.Provider value={value}>{children}</TutorContext.Provider>
  );
};

export const useTutorConfig = (): TutorConfig => {
  const config = useContext(TutorContext);
  if (!config) {
    throw new Error(
      'AI Tutor components must be rendered inside a <TutorProvider>.',
    );
  }
  return config;
};
