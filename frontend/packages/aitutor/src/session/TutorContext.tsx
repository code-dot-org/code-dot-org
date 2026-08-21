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

import type {TutorSessionInfo, TutorTransport} from '../transport/types';

/** A set of file edits the tutor is proposing (specs/PLAN.md §8). */
export interface TutorProposal {
  explanation: string;
  files: Array<{path: string; contents: string}>;
}

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
   */
  context?: () => string | Promise<string>;

  systemPrompt?: string;

  /**
   * A JSON Schema, when this session wants files back rather than prose.
   *
   * Its presence is what turns a reply into a possible proposal.
   */
  responseSchema?: object;

  /**
   * What to do with a proposal.
   *
   * The host decides what a file is, whether the workspace goes read-only while
   * the proposal stands, and what accepting one commits — none of which this
   * package can know. Returning nothing means the proposal is shown as prose.
   */
  onProposal?: (proposal: TutorProposal) => void;
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
      config.systemPrompt,
      config.responseSchema,
      config.onProposal,
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
