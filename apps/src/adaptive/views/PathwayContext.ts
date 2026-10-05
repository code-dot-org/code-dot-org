// The pathway around the checkpoint being played, for descendants that need
// more than their own step: today, the tutor briefing a level step assembles.

import {createContext} from 'react';

import useRequiredContext from '@cdo/apps/util/hooks/useRequiredContext';

import {CheckpointStatusMap} from '../progress/model';
import {Checkpoint, Pathway} from '../types';

export interface PathwayContextValue {
  pathway: Pathway;
  checkpoint: Checkpoint;
  statusMap: CheckpointStatusMap;
}

export const PathwayContext = createContext<PathwayContextValue | null>(null);

export const usePathwayContext = () =>
  useRequiredContext(PathwayContext, 'PathwayContext');
