// CONTRACTS
import askContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/ask.md';
import buildCSVContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/buildCSV.md';
import buildJSONContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/buildJSON.md';
import buildPythonContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/buildPython.md';
import debugContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/debug.md';
import documentationContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/documentation.md';
import exampleContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/example.md';
import explainCodeContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/explainCode.md';
import hintContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/hint.md';
import pseudocodeContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/pseudocode.md';
import refusalContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/refusal.md';
import refusalPythonSnippetsContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/refusalPythonSnippets.md';
import testCaseContract from '@cdo/apps/pythonlab/prompts/answerTypeContracts/testCase.md';
// TRIGGERS
import askTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/ask.md';
import buildCSVTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/buildCSV.md';
import buildJSONTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/buildJSON.md';
import buildPythonTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/buildPython.md';
import debugTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/debug.md';
import documentationTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/documentation.md';
import exampleTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/example.md';
import explainCodeTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/explainCode.md';
import hintTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/hint.md';
import pseudocodeTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/pseudocode.md';
import refusalTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/refusal.md';
import refusalPythonSnippetsTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/refusalPythonSnippets.md';
import testCaseTrigger from '@cdo/apps/pythonlab/prompts/answerTypeTriggers/testCase.md';
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
