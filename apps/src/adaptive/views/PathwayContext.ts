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
}

export const PathwayContext = createContext<PathwayContextValue | null>(null);

export const usePathwayContext = () =>
  useRequiredContext(PathwayContext, 'PathwayContext');
