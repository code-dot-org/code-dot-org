import {MetricEvent} from '@cdo/apps/metrics/events';
import MetricsReporter from '@cdo/apps/metrics/MetricsReporter';
import HttpClient from '@cdo/apps/util/HttpClient';

import {LevelSkill, Skill} from './types';

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

export async function updateSkill(skillId: number, skill: Partial<Skill>) {
  try {
    const response = await HttpClient.put(
      `/skills/${skillId}`,
      JSON.stringify(skill),
      true,
      {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    );
    const json = await response.json();
    if (json.status === 'success') {
      return json;
    } else {
      throw new Error(`Failed to update skill: ${json.error}`);
    }
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.SKILL_UPDATE_FAIL,
      errorMessage:
        (error as Error).message || `Failed to update Skill ${skillId}`,
    });
  }
}

export async function addSkillToLevel(levelSkill: LevelSkill) {
  const response = await HttpClient.post(
    `/levels/${levelSkill.levelId}/add_skill`,
    JSON.stringify(levelSkill),
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

export async function removeSkillFromLevel(levelSkill: LevelSkill) {
  try {
    const response = await HttpClient.post(
      `/levels/${levelSkill.levelId}/remove_skill`,
      JSON.stringify(levelSkill),
      true,
      {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    );
    const json = await response.json();
    if (json.status === 'success') {
      return json;
    } else {
      throw new Error(`Failed to remove skill from level: ${json.error}`);
    }
  } catch (error) {
    MetricsReporter.logError({
      event: MetricEvent.LEVELS_SKILL_DELETE_FAIL,
      errorMessage:
        (error as Error).message ||
        `Failed to remove Skill ${levelSkill.skillId} from Level ${levelSkill.levelId}`,
    });
    throw error;
  }
}
