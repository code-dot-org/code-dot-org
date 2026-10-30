/**
 * Predefined Prompts Library - Main Export File
 *
 * This file provides two import styles for maximum flexibility:
 *
 * GROUPED IMPORTS (Recommended for new code):
 * -----------------------------------------------
 * import { contextPrompts, personaPrompts } from './predefinedPrompts';
 *
 * // Access prompts through organized groups
 * const prompt1 = contextPrompts.curriculum.EXPLAIN_CONCEPT_PROMPT;
 * const prompt2 = personaPrompts.innovator.NEW_WAYS_PROMPT;
 *
 * // Can destructure if you need multiple from same category
 * const { EXPLAIN_CONCEPT_PROMPT, EXAMPLE_PROMPT } = contextPrompts.curriculum;
 * const { NEW_WAYS_PROMPT, CREATIVE_EXTENSION_PROMPT } = personaPrompts.innovator;
 *
 * INDIVIDUAL IMPORTS (Backwards compatible):
 * -----------------------------------------------
 * import {
 *   EXPLAIN_CONCEPT_PROMPT,
 *   NEW_WAYS_PROMPT
 * } from './predefinedPrompts';
 *
 * // Works exactly as before
 * const prompt = EXPLAIN_CONCEPT_PROMPT;
 *
 * File Organization:
 * ------------------
 * context/           - Context-specific prompts (curriculum, platform, courses)
 * personas/          - Teaching persona prompts (innovator, storyteller, etc.)
 * menuConfigurations.ts - Menu configuration mappings
 */

// ==================== GROUPED EXPORTS (RECOMMENDED) ====================

// Import grouped objects from categories
export {contextPrompts} from './context';
export {personaPrompts} from './personas';

// ==================== INDIVIDUAL EXPORTS (BACKWARDS COMPATIBLE) ====================

// Re-export all context prompts individually
export * from './context/curriculumPrompts';
export * from './context/activityPrompts';
export * from './context/platformPrompts';
export * from './context/apCSPPrompts';
export * from './context/aifPrompts';
export * from './context/codePrompts';

// Export menu configurations
export * from './menuConfigurations';
