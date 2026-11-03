// The pathway around the checkpoint being played, for descendants that need
// more than their own step: the tutor briefing and generated instructions a
// level step assembles.

import {createContext} from 'react';

import {AichatContext} from '@cdo/apps/aichat/types';
import useRequiredContext from '@cdo/apps/util/hooks/useRequiredContext';

import {
  CheckpointStatusMap,
  GeneratedContent,
  Progress,
  ValidationAttempt,
} from '../progress/model';
import {Checkpoint, Pathway, Step} from '../types';

export interface PathwayContextValue {
  pathway: Pathway;
  checkpoint: Checkpoint;
  statusMap: CheckpointStatusMap;
  progress: Progress;
  saveGeneratedInstructions: (
    stepId: string,
    content: GeneratedContent
  ) => void;
  /** Records one check of a project step's work. */
  recordValidation: (
    step: Step,
    attempt: Omit<ValidationAttempt, 'at'>
  ) => void;
  /** What the shell's own AI calls present for an access token. */
  aiContext: AichatContext;
  /**
   * Whether the student asked, on a review step, for the project to be
   * built at the next project step with a prompt. The review sets it, that
   * step spends it, and leaving the checkpoint drops it.
   */
  buildRequested: boolean;
  setBuildRequested: (requested: boolean) => void;
}

export const PathwayContext = createContext<PathwayContextValue | null>(null);

export const usePathwayContext = () =>
  useRequiredContext(PathwayContext, 'PathwayContext');
