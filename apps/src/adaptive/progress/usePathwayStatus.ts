// Imports only the model and routing, so a caller outside the lab can use it
// without the progress barrel, which brings in Lab2Registry.

import {useMemo} from 'react';

import {computeEvidence} from '../routing/evidence';
import {routeStatusMap} from '../routing/route';
import {Pathway} from '../types';

import {EMPTY_PROGRESS, Progress} from './model';

/** Each checkpoint's status and the evidence it is routed on; undefined progress reads as none. */
export function usePathwayStatus(pathway: Pathway, progress?: Progress) {
  const evidence = useMemo(
    () => computeEvidence(pathway, progress ?? EMPTY_PROGRESS),
    [pathway, progress]
  );
  const statusMap = useMemo(
    () => routeStatusMap(pathway, progress ?? EMPTY_PROGRESS, evidence),
    [pathway, progress, evidence]
  );
  return {evidence, statusMap};
}
