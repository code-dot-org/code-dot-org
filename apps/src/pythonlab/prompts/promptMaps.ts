// CONTRACTS (shared)
import askContract from '@cdo/apps/aiTutor/prompts/answerTypeContracts/ask.md';
import refusalContract from '@cdo/apps/aiTutor/prompts/answerTypeContracts/refusal.md';
import testCaseContract from '@cdo/apps/aiTutor/prompts/answerTypeContracts/testCase.md';
// CONTRACTS (pythonlab-specific)
import buildJSONTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/buildJSON.md';
import debugTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/debug.md';
import exampleTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/example.md';
import pseudocodeTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/pseudocode.md';
import refusalTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/refusal.md';
import testCaseTrigger from '@cdo/apps/aiTutor/prompts/answerTypeTriggers/testCase.md';
import buildCSVContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/buildCSV.md';
import buildJSONContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/buildJSON.md';
import buildPythonContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/buildPython.md';
import debugContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/debug.md';
import documentationContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/documentation.md';
import exampleContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/example.md';
import explainCodeContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/explainCode.md';
import hintContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/hint.md';
import pseudocodeContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/pseudocode.md';
import refusalPythonSnippetsContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/refusalPythonSnippets.md';
// TRIGGERS (shared)
// TRIGGERS (pythonlab-specific)
import askTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/ask.md';
import buildCSVTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/buildCSV.md';
import buildPythonTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/buildPython.md';
import documentationTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/documentation.md';
import explainCodeTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/explainCode.md';
import hintTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/hint.md';
import refusalPythonSnippetsTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/refusalPythonSnippets.md';
// TYPES
import {AiTutorAnswerType} from '@cdo/apps/pythonlab/types';

export const ANSWER_TYPE_TRIGGERS: Record<AiTutorAnswerType, string> = {
  ask: askTrigger,
  buildPython: buildPythonTrigger,
  buildCSV: buildCSVTrigger,
  buildJSON: buildJSONTrigger,
  debug: debugTrigger,
  documentation: documentationTrigger,
  example: exampleTrigger,
  explainCode: explainCodeTrigger,
  hint: hintTrigger,
  pseudocode: pseudocodeTrigger,
  refusal: refusalTrigger,
  refusalPythonSnippets: refusalPythonSnippetsTrigger,
  testCase: testCaseTrigger,
};

export const ANSWER_TYPE_CONTRACTS: Record<AiTutorAnswerType, string> = {
  ask: askContract,
  buildPython: buildPythonContract,
  buildCSV: buildCSVContract,
  buildJSON: buildJSONContract,
  debug: debugContract,
  documentation: documentationContract,
  example: exampleContract,
  explainCode: explainCodeContract,
  hint: hintContract,
  pseudocode: pseudocodeContract,
  refusal: refusalContract,
  refusalPythonSnippets: refusalPythonSnippetsContract,
  testCase: testCaseContract,
};
