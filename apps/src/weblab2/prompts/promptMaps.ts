// CONTRACTS (shared)
import askContract from '@cdo/apps/aiTutor/prompts/answerTypeContracts/ask.md';
import refusalContract from '@cdo/apps/aiTutor/prompts/answerTypeContracts/refusal.md';
import testCaseContract from '@cdo/apps/aiTutor/prompts/answerTypeContracts/testCase.md';
// CONTRACTS (weblab2-specific)
import buildJSONTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/buildJSON.md';
import debugTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/debug.md';
import exampleTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/example.md';
import pseudocodeTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/pseudocode.md';
import refusalTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/refusal.md';
import testCaseTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/testCase.md';
import buildCSSContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildCSS.md';
import buildHTMLContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildHTML.md';
import buildJavaScriptContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildJavaScript.md';
import buildJSONContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildJSON.md';
import debugContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/debug.md';
import documentationContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/documentation.md';
import exampleContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/example.md';
import explainCodeContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/explainCode.md';
import hintContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/hint.md';
import pseudocodeContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/pseudocode.md';
import refusalJavaScriptSnippetsContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/refusalJavaScriptSnippets.md';
// TRIGGERS (shared)
// TRIGGERS (weblab2-specific)
import askTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/ask.md';
import buildCSSTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildCSS.md';
import buildHTMLTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildHTML.md';
import buildJavaScriptTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/buildJavaScript.md';
import documentationTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/documentation.md';
import explainCodeTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/explainCode.md';
import hintTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/hint.md';
import refusalJavaScriptSnippetsTrigger from '@cdo/apps/weblab2/prompts/answerTypeTriggers/refusalJavaScriptSnippets.md';
// TYPES
import {AiTutorAnswerType} from '@cdo/apps/weblab2/types';

export const ANSWER_TYPE_TRIGGERS: Record<AiTutorAnswerType, string> = {
  ask: askTrigger,
  buildCSS: buildCSSTrigger,
  buildHTML: buildHTMLTrigger,
  buildJavaScript: buildJavaScriptTrigger,
  buildJSON: buildJSONTrigger,
  debug: debugTrigger,
  documentation: documentationTrigger,
  example: exampleTrigger,
  explainCode: explainCodeTrigger,
  hint: hintTrigger,
  pseudocode: pseudocodeTrigger,
  refusal: refusalTrigger,
  refusalJavaScriptSnippets: refusalJavaScriptSnippetsTrigger,
  testCase: testCaseTrigger,
};

export const ANSWER_TYPE_CONTRACTS: Record<AiTutorAnswerType, string> = {
  ask: askContract,
  buildCSS: buildCSSContract,
  buildHTML: buildHTMLContract,
  buildJavaScript: buildJavaScriptContract,
  buildJSON: buildJSONContract,
  debug: debugContract,
  documentation: documentationContract,
  example: exampleContract,
  explainCode: explainCodeContract,
  hint: hintContract,
  pseudocode: pseudocodeContract,
  refusal: refusalContract,
  refusalJavaScriptSnippets: refusalJavaScriptSnippetsContract,
  testCase: testCaseContract,
};
