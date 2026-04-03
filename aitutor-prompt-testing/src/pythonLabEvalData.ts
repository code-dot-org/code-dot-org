/**
 * Expected AI tutor output for each (level × state × videoRequested) combination.
 *
 * Keys follow the pattern:
 *   `${levelId}_${StudioStateEnum}_VIDEO`   — student explicitly asked for a video
 *   `${levelId}_${StudioStateEnum}_NOVIDEO` — student did not ask for a video
 *
 * `expectedVideos` is the set of videos the AI tutor should return (empty = none expected).
 */
import {PythonLabEvalEntry} from './aiTutorTestTypes';

export const pythonLabEvalData: Record<string, PythonLabEvalEntry> = {
};
