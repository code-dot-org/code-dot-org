import {Skill} from '../types';

/**
 * A skill's evidence levels as prompt lines: the skill named and described,
 * then one line per level. Empty when the skill describes no levels.
 */
export function describeEvidenceLevels(skill: Skill): string {
  const levels = Object.entries(skill.evidenceLevels ?? {});
  if (levels.length === 0) return '';
  return [
    `EVIDENCE LEVELS for the skill "${skill.title}": ${skill.description}`,
    ...levels.map(([level, description]) => `- ${level}: ${description}`),
  ].join('\n');
}
