// Utilities for parsing pathway content, both for resolved server content
// and source files.

import {z} from 'zod';

import {pathwaySchema, pathwaySourceSchema} from '../pathway';

import {referenceProblems} from './references';

type Pathway = z.infer<typeof pathwaySchema>;
type PathwaySource = z.infer<typeof pathwaySourceSchema>;

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

/** Parses and validates a pathway JSON source file. */
export function parsePathwaySource(raw: unknown): PathwaySource {
  const result = pathwaySourceSchema.safeParse(raw);
  if (!result.success) {
    throw new AdaptiveContentError(formatIssues(result.error));
  }
  return result.data;
}

export {referenceProblems} from './references';
