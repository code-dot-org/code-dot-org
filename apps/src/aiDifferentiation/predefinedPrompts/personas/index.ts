/**
 * Teaching Persona Prompts Index
 *
 * This file groups all teaching persona prompts into a single exportable object.
 * Persona prompts are organized by teaching style and help teachers approach
 * lessons in ways that match their pedagogical preferences.
 */

import * as bridgeBuilder from './bridgeBuilderPrompts';
import * as codeWhisperer from './codeWhispererPrompts';
import * as communityArchitect from './communityArchitectPrompts';
import * as innovator from './innovatorPrompts';
import * as leadLearner from './leadLearnerPrompts';
import * as storyteller from './storytellerPrompts';

export const personaPrompts = {
  innovator,
  codeWhisperer,
  bridgeBuilder,
  storyteller,
  communityArchitect,
  leadLearner,
};
