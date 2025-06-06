import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';

interface Skill {
  key: string;
  description: string;
  evaluationCriteria: string;
  concept: string;
}

export async function createSkill(skill: Skill) {
  const response = await HttpClient.post(
    '/skills',
    JSON.stringify(skill),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  )
    .then(response => response.json())
    .then(json => {
      if (json.status === 'success') {
        return json;
      } else {
        throw new Error(`Failed to create skill: ${json.error}`);
      }
    })
    .catch(error => {
      MetricsReporter.logError({
        event: MetricEvent.SKILL_SAVE_FAIL,
        errorMessage: (error as Error).message || 'Failed to save Skill',
      });
    });
  return response;
}

interface LevelsSkill {
  skillId: number;
  levelId: number;
}

export async function createLevelsSkill(levelsSkill: LevelsSkill) {
  const response = await HttpClient.post(
    '/levels_skills',
    JSON.stringify(levelsSkill),
    true,
    {
      'Content-Type': 'application/json; charset=UTF-8',
    }
  )
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        return json;
      } else {
        throw new Error(`Failed to create LevelsSkill: ${json.error}`);
      }
    })
    .catch(error => {
      MetricsReporter.logError({
        event: MetricEvent.LEVELS_SKILL_SAVE_FAIL,
        errorMessage: (error as Error).message || 'Failed to save LevelsSkill',
      });
    });

  return response;
}
