// The pathway around the checkpoint being played, for descendants that need
// more than their own step: the tutor briefing and generated instructions a
// level step assembles.

import {createContext} from 'react';

import {AichatContext} from '@cdo/apps/aichat/types';
import useRequiredContext from '@cdo/apps/util/hooks/useRequiredContext';

import {CheckpointStatusMap, StepContext} from '../progress/model';
import {Checkpoint, Pathway} from '../types';

export interface PathwayContextValue {
  pathway: Pathway;
  checkpoint: Checkpoint;
  statusMap: CheckpointStatusMap;
  stepContextMap: {[stepId: string]: StepContext};
  updateStepContext: (stepId: string, patch: StepContext) => void;
  /** What the shell's own AI calls present for an access token. */
  aiContext: AichatContext;
}

export const PathwayContext = createContext<PathwayContextValue | null>(null);

export const usePathwayContext = () =>
  useRequiredContext(PathwayContext, 'PathwayContext');
