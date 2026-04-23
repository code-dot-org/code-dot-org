import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import EditAiTutorPromptSettings from '@cdo/apps/lab2/levelEditors/aiTutorPromptSettings/EditAiTutorPromptSettings';
import {AiTutorAnswerType} from '@cdo/apps/weblab2/types';

jest.mock('@cdo/apps/templates/EnhancedSafeMarkdown', () => () => null);
jest.mock('@cdo/apps/weblab2/prompts/promptMaps', () => ({
  ANSWER_TYPE_CONTRACTS: {},
}));

const ALL_TOGGLEABLE_TYPES: AiTutorAnswerType[] = [
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

describe('EditAiTutorPromptSettings', () => {
  describe('Enable All button', () => {
    it('enables all 12 types from empty state', () => {
      render(
        <EditAiTutorPromptSettings
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
          promptSettings={{answerTypes: ALL_TOGGLEABLE_TYPES}}
        />
      );
      fireEvent.click(screen.getByRole('button', {name: 'Disable All'}));
      expect(screen.getByRole('button', {name: 'Disable All'})).toBeDisabled();
    });
  });
});
