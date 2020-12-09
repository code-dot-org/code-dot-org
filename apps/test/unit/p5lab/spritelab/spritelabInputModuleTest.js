import spritelabInputList, * as spritelabInputModule from '@cdo/apps/p5lab/spritelab/spritelabInputModule';
import {expect} from '../../../util/reconfiguredChai';

const PromptType = spritelabInputModule.PromptType;

describe('spritelabInputModule', () => {
  const initialState = [];
  it('has expected default state', () => {
    expect(spritelabInputList(undefined, {})).to.deep.equal(initialState);
  });

  it('returns original state on unhandled action', () => {
    const state = {abc: 'def'};
    expect(spritelabInputList(state, {})).to.equal(state);
  });

  describe('addTextPrompt', () => {
    const addTextPrompt = spritelabInputModule.addTextPrompt;
    it('adds a text prompt to an empty list', () => {
      const state = [];
      const newState = spritelabInputList(
        state,
        addTextPrompt('promptText', 'variableName')
      );
      expect(newState).to.deep.equal([
        {
          promptType: PromptType.TEXT,
          promptText: 'promptText',
          variableName: 'variableName'
        }
      ]);
    });

    it('adds a text prompt to the end of the list', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'}
      ];
      const newState = spritelabInputList(
        state,
        addTextPrompt('promptText', 'variableName')
      );
      expect(newState).to.deep.equal([
        ...state,
        {
          promptType: PromptType.TEXT,
          promptText: 'promptText',
          variableName: 'variableName'
        }
      ]);
    });
  });

  describe('addMultipleChoicePrompt', () => {
    const addMultipleChoicePrompt =
      spritelabInputModule.addMultipleChoicePrompt;
    it('adds a multiple choice prompt to an empty list', () => {
      const state = [];
      const newState = spritelabInputList(
        state,
        addMultipleChoicePrompt('promptText', 'variableName', [
          'choice1',
          'choice2'
        ])
      );
      expect(newState).to.deep.equal([
        {
          promptType: PromptType.MULTIPLE_CHOICE,
          promptText: 'promptText',
          variableName: 'variableName',
          choices: ['choice1', 'choice2']
        }
      ]);
    });

    it('adds a multiple choice prompt to the end of the list', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'}
      ];
      const newState = spritelabInputList(
        state,
        addMultipleChoicePrompt('promptText', 'variableName', [
          'choice1',
          'choice2',
          'choice3'
        ])
      );
      expect(newState).to.deep.equal([
        ...state,
        {
          promptType: PromptType.MULTIPLE_CHOICE,
          promptText: 'promptText',
          variableName: 'variableName',
          choices: ['choice1', 'choice2', 'choice3']
        }
      ]);
    });
  });

  describe('popPrompt', () => {
    const popPrompt = spritelabInputModule.popPrompt;
    it('gracefully handles empty list', () => {
      const state = [];
      const newState = spritelabInputList(state, popPrompt());
      expect(newState).to.deep.equal([]);
    });
    it('removes the first prompt from the list', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'}
      ];
      const newState = spritelabInputList(state, popPrompt());
      expect(newState).to.deep.equal([
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'}
      ]);
    });
  });

  describe('clearPrompts', () => {
    const clearPrompts = spritelabInputModule.clearPrompts;
    it('returns []', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'}
      ];
      const newState = spritelabInputList(state, clearPrompts());
      expect(newState).to.deep.equal([]);
    });
  });
});
