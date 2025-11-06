/**
 * Predefined Prompts Library - Main Export File
 *
 * This file re-exports all prompts and configurations from the library,
 * maintaining backwards compatibility with existing imports.
 *
 * File Organization:
 * - types.ts: TypeScript interfaces for prompts
 * - curriculumPrompts.ts: Curriculum planning and iteration
 * - activityPrompts.ts: Activity creation
 * - platformPrompts.ts: Code.org platform support
 * - apCSPPrompts.ts: AP Computer Science Principles course-specific
 * - aifPrompts.ts: AI Fundamentals course-specific
 * - codePrompts.ts: Code-level context prompts
 * - menuConfigurations.ts: Menu configuration mappings
 *
 * Usage:
 * Import any prompt or configuration directly from this index:
 *
 *   import {
 *     EXPLAIN_CONCEPT_PROMPT,
 *     SUGGESTED_PROMPTS_FOR_SELECTION
 *   } from './predefinedPrompts';
 */

// Export all curriculum prompts
export * from './curriculumPrompts';

// Export all activity prompts
export * from './activityPrompts';

// Export all platform prompts
export * from './platformPrompts';

// Export all AP CSP prompts
export * from './apCSPPrompts';

// Export all AIF prompts
export * from './aifPrompts';

// Export all code-level prompts
export * from './codePrompts';

// Export menu configurations
export * from './menuConfigurations';
