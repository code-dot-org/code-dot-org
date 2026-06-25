import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditAiTutorPromptSettings from '@cdo/apps/lab2/levelEditors/aiTutorPromptSettings/EditAiTutorPromptSettings';

jest.mock('@cdo/apps/templates/EnhancedSafeMarkdown', () => () => null);

const ALL_TOGGLEABLE_TYPES = [
  'ask',
  'buildCSS',
  'buildHTML',
  'buildJavaScript',
  'buildJSON',
  'debug',
  'documentation',
  'example',
  'explainCode',
  'hint',
  'pseudocode',
  'testCase',
];

const ANSWER_TYPE_TO_LABEL: Record<string, string> = {
  ask: 'Ask',
  buildCSS: 'Build CSS',
  buildHTML: 'Build HTML',
  buildJavaScript: 'Build JavaScript',
  buildJSON: 'Build JSON',
  debug: 'Debug',
  documentation: 'Documentation',
  example: 'Example',
  explainCode: 'Explain Code',
  hint: 'Hint',
  pseudocode: 'Pseudocode',
  testCase: 'Test Case',
};

const WEBLAB2_PROPS = {
  toggleableAnswerTypes: ALL_TOGGLEABLE_TYPES,
  answerTypeToLabel: ANSWER_TYPE_TO_LABEL,
  answerTypeContracts: {} as Record<string, string>,
  defaultAnswerTypes: ALL_TOGGLEABLE_TYPES,
};

describe('EditAiTutorPromptSettings', () => {
  describe('Enable All button', () => {
    it('enables all 12 types from empty state', () => {
      render(
        <EditAiTutorPromptSettings
          {...WEBLAB2_PROPS}
          promptSettings={{answerTypes: ALL_TOGGLEABLE_TYPES}}
        />
      );
      // reach empty state first
      fireEvent.click(screen.getByRole('button', {name: 'Disable All'}));
      fireEvent.click(screen.getByRole('button', {name: 'Enable All'}));
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(12);
      checkboxes.forEach(cb => expect(cb).toBeChecked());
    });

    it('enables all 12 types from partial state', () => {
      render(
        <EditAiTutorPromptSettings
          {...WEBLAB2_PROPS}
          promptSettings={{answerTypes: ['ask', 'hint']}}
        />
      );
      fireEvent.click(screen.getByRole('button', {name: 'Enable All'}));
      screen.getAllByRole('checkbox').forEach(cb => expect(cb).toBeChecked());
    });
  });

  describe('Disable All button', () => {
    it('clears all types from fully-enabled state', () => {
      render(
        <EditAiTutorPromptSettings
          {...WEBLAB2_PROPS}
          promptSettings={{answerTypes: ALL_TOGGLEABLE_TYPES}}
        />
      );
      fireEvent.click(screen.getByRole('button', {name: 'Disable All'}));
      screen
        .getAllByRole('checkbox')
        .forEach(cb => expect(cb).not.toBeChecked());
    });

    it('clears all types from partial state', () => {
      render(
        <EditAiTutorPromptSettings
          {...WEBLAB2_PROPS}
          promptSettings={{answerTypes: ['ask', 'debug', 'hint']}}
        />
      );
      fireEvent.click(screen.getByRole('button', {name: 'Disable All'}));
      screen
        .getAllByRole('checkbox')
        .forEach(cb => expect(cb).not.toBeChecked());
    });

    it('is disabled when no types are enabled', () => {
      render(
        <EditAiTutorPromptSettings
          {...WEBLAB2_PROPS}
          promptSettings={{answerTypes: ALL_TOGGLEABLE_TYPES}}
        />
      );
      fireEvent.click(screen.getByRole('button', {name: 'Disable All'}));
      expect(screen.getByRole('button', {name: 'Disable All'})).toBeDisabled();
    });
  });
});
