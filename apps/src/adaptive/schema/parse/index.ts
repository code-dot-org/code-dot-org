// Utilities for parsing pathway and skill content, both for resolved
// server content and source files.

import {z} from 'zod';

import {pathwaySchema, pathwaySourceSchema} from '../pathway';
import {skillSourceSchema} from '../skill';

import {referenceProblems} from './references';

type Pathway = z.infer<typeof pathwaySchema>;
type PathwaySource = z.infer<typeof pathwaySourceSchema>;
type SkillSource = z.infer<typeof skillSourceSchema>;

export class AdaptiveContentError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid adaptive content:\n  ${problems.join('\n  ')}`);
    this.name = 'AdaptiveContentError';
  }
}

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map(
    issue => `${issue.path.join('.') || '(root)'}: ${issue.message}`
  );
}

/** Parses and validates pathway content returned by the server. */
export function parsePathway(raw: unknown): Pathway {
  const result = pathwaySchema.safeParse(raw);
  if (!result.success) {
    throw new AdaptiveContentError(formatIssues(result.error));
  }
  const problems = referenceProblems(result.data);
  if (problems.length > 0) {
    throw new AdaptiveContentError(problems);
  }
  return result.data;
}

/** Parses and validates a skill JSON source file. */
export function parseSkillSource(raw: unknown): SkillSource {
  const result = skillSourceSchema.safeParse(raw);
  if (!result.success) {
    throw new AdaptiveContentError(formatIssues(result.error));
  }
  return result.data;
}

export {referenceProblems} from './references';

/** Parses and validates a pathway JSON source file. */
export function parsePathwaySource(raw: unknown): PathwaySource {
  const result = pathwaySourceSchema.safeParse(raw);
  if (!result.success) {
    throw new AdaptiveContentError(formatIssues(result.error));
  }
  return result.data;
}
