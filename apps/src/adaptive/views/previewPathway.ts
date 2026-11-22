// A pathway being edited, as the preview plays it. The edit page sends the
// pathway as authored; the parts the server resolves (each level step's
// level properties, the project's, a video step's links) are taken from
// the saved pathway the page was served with, matched by level name and
// video key. A level or video the saved pathway does not name stays
// unresolved, and its step shows as not found.

import {PreviewPlace} from '@cdo/apps/lab2/levelEditors/levelConfig/levelPreview';

import {Pathway} from '../types';

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  !!value && typeof value === 'object' && !Array.isArray(value);

function stepsOf(pathway: Json): Json[] {
  const checkpoints = [
    ...(Array.isArray(pathway.checkpoints) ? pathway.checkpoints : []),
    ...(isObject(pathway.finish) && isObject(pathway.finish.checkpoint)
      ? [pathway.finish.checkpoint]
      : []),
  ].filter(isObject);
  return checkpoints.flatMap(checkpoint =>
    (Array.isArray(checkpoint.steps) ? checkpoint.steps : []).filter(isObject)
  );
}

export function withServedParts(edited: unknown, served: unknown): unknown {
  if (!isObject(edited) || !isObject(served)) {
    return edited;
  }
  const copy = JSON.parse(JSON.stringify(edited)) as Json;
  const servedSteps = stepsOf(served);
  const levels = new Map<string, unknown>();
  const videos = new Map<string, Json>();
  servedSteps.forEach(step => {
    if (typeof step.level === 'string' && step.levelProperties) {
      levels.set(step.level, step.levelProperties);
    }
    if (typeof step.videoKey === 'string') {
      videos.set(step.videoKey, step);
    }
  });
  stepsOf(copy).forEach(step => {
    if (typeof step.level === 'string' && levels.has(step.level)) {
      step.levelProperties = levels.get(step.level);
    }
    const video =
      typeof step.videoKey === 'string' && videos.get(step.videoKey);
    if (video) {
      ['src', 'download', 'thumbnail'].forEach(key => {
        if (video[key] !== undefined) {
          step[key] = video[key];
        }
      });
    }
  });
  if (
    isObject(copy.project) &&
    isObject(served.project) &&
    copy.project.templateLevel === served.project.templateLevel
  ) {
    copy.project.levelProperties = served.project.levelProperties;
  }
  return copy;
}

const MAP_PLACE = 'map';

/** The map, each checkpoint and each of its steps, for the preview's menu. */
export function previewPlaces(pathway: Pathway): PreviewPlace[] {
  return [
    {id: MAP_PLACE, label: 'The map'},
    ...pathway.checkpoints.flatMap(checkpoint => [
      {id: checkpoint.id, label: `Checkpoint: ${checkpoint.title}`},
      ...checkpoint.steps.map(step => ({
        id: `${checkpoint.id}/${step.id}`,
        label: `${checkpoint.title} / ${step.title}`,
      })),
    ]),
  ];
}

/** The checkpoint and step a place opens; none for the map. */
export function placeTarget(
  pathway: Pathway,
  place: string
): {checkpointId: string; stepId: string} | undefined {
  if (place === MAP_PLACE) {
    return undefined;
  }
  const [checkpointId, stepId] = place.split('/');
  const checkpoint = pathway.checkpoints.find(cp => cp.id === checkpointId);
  const step = stepId ?? checkpoint?.steps[0]?.id;
  return checkpoint && step ? {checkpointId, stepId: step} : undefined;
}
