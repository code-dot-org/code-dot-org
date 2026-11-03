import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import {CheckpointStatus, CheckpointStatusMap} from './progress/model';
import {Checkpoint, Pathway, Step} from './types';

type Properties = {[key: string]: string | number | boolean | undefined};

let pathwayProperties: Properties = {};

export function setAdaptiveMetricsContext(properties: {
  pathwayId: string;
  levelId: number;
  scriptId: number;
}) {
  pathwayProperties = properties;
}

export function sendAdaptiveEvent(
  event: string,
  properties: Properties = {},
  value?: string
) {
  const payload = Object.fromEntries(
    Object.entries({...pathwayProperties, ...properties}).filter(
      ([, v]) => v !== undefined
    )
  ) as Record<string, string | number | boolean>;
  analyticsReporter.sendEvent(event, payload, true, value);
}

export function stepProperties(checkpoint: Checkpoint, step: Step) {
  return {
    checkpointId: checkpoint.id,
    stepId: step.id,
    stepKind: step.kind,
    stepName: step.title,
    levelName: step.kind === 'level' ? step.level : undefined,
  };
}

export function statusCounts(statusMap: CheckpointStatusMap) {
  const count = (status: CheckpointStatus) =>
    Object.values(statusMap).filter(s => s === status).length;
  return {
    completeCount: count('complete'),
    skippedCount: count('skipped'),
    availableCount: count('available'),
  };
}

export type FinalProjectSource = 'mapHeader' | 'projectCard' | 'stepHeader';

export function sendFinalProjectClicked(
  source: FinalProjectSource,
  statusMap: CheckpointStatusMap,
  from?: {checkpoint: Checkpoint; step: Step}
) {
  const fromStep = from && stepProperties(from.checkpoint, from.step);
  sendAdaptiveEvent(
    EVENTS.ADAPTIVE_FINAL_PROJECT_BUTTON_CLICKED,
    {
      source,
      ...statusCounts(statusMap),
      fromStepName: fromStep?.stepName,
      fromLevelName: fromStep?.levelName,
    },
    source
  );
}

export function firstProjectStepId(pathway: Pathway): string | undefined {
  for (const checkpoint of pathway.checkpoints) {
    const step = checkpoint.steps.find(s => s.kind === 'level' && s.project);
    if (step) return step.id;
  }
  return undefined;
}
