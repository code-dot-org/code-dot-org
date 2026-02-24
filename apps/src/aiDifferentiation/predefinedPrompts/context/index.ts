/**
 * Context-Specific Prompts Index
 *
 * This file groups all context-specific prompts into a single exportable object.
 * Context prompts appear based on where the teacher is in the application
 * (curriculum pages, platform pages, code levels, etc.)
 */

import * as activities from './activityPrompts';
import * as aif from './aifPrompts';
import * as apCSP from './apCSPPrompts';
import * as code from './codePrompts';
import * as curriculum from './curriculumPrompts';
import * as platform from './platformPrompts';

export const contextPrompts = {
  curriculum,
  activities,
  platform,
  apCSP,
  aif,
  code,
};

// Also re-export everything individually for backwards compatibility
export * from './curriculumPrompts';
export * from './activityPrompts';
export * from './platformPrompts';
export * from './apCSPPrompts';
export * from './aifPrompts';
export * from './codePrompts';
