import {CheckpointStatusMap} from '../../progress';
import {DestinationColor} from '../../schema/destination';
import {Pathway} from '../../types';

/** A group of checkpoints and how far the student is through it, as a ring draws it. */
export interface GroupProgress {
  key: string;
  title: string;
  icon?: string;
  /** The ring's color; the brand purple when absent. */
  color?: DestinationColor;
  /** Checkpoints of the group the student is past: complete or skipped. */
  done: number;
  total: number;
}

const isDone = (status: string | undefined) =>
  status === 'complete' || status === 'skipped';

/**
 * Each skill with how many of the checkpoints developing it are done, in
 * the pathway's order.
 */
export function getSkillProgress(
  pathway: Pathway,
  statusMap: CheckpointStatusMap
): GroupProgress[] {
  return Object.entries(pathway.skills).map(([key, skill]) => {
    const members = pathway.checkpoints.filter(c => c.skillIds?.includes(key));
    const done = members.filter(c => isDone(statusMap[c.id])).length;
    return {
      key,
      title: skill.title,
      icon: skill.icon,
      done,
      total: members.length,
    };
  });
}

/** Each declared destination with how many of its checkpoints are done, in declared order. */
export function getDestinationProgress(
  pathway: Pathway,
  statusMap: CheckpointStatusMap
): GroupProgress[] {
  return Object.entries(pathway.destinations ?? {}).map(([key, declared]) => {
    const members = pathway.checkpoints.filter(c => c.destination === key);
    const done = members.filter(c => isDone(statusMap[c.id])).length;
    return {key, ...declared, done, total: members.length};
  });
}

/** How many checkpoints the student has completed, skips not counted. */
export function completedCount(statusMap: CheckpointStatusMap): number {
  return Object.values(statusMap).filter(s => s === 'complete').length;
}
