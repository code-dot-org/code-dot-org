import spritelabInputList, * as spritelabInput from '@cdo/apps/p5lab/redux/spritelabInput';

const PromptType = spritelabInput.PromptType;

describe('spritelabInput', () => {
  const initialState = [];
  it('has expected default state', () => {
    expect(spritelabInputList(undefined, {})).toEqual(initialState);
  });

  it('returns original state on unhandled action', () => {
    const state = {abc: 'def'};
    expect(spritelabInputList(state, {})).toBe(state);
  });

  describe('addTextPrompt', () => {
    const addTextPrompt = spritelabInput.addTextPrompt;
    it('adds a text prompt to an empty list', () => {
      const state = [];
      const newState = spritelabInputList(
        state,
        addTextPrompt('promptText', 'variableName')
      );
      expect(newState).toEqual([
        {
          promptType: PromptType.TEXT,
          promptText: 'promptText',
          variableName: 'variableName',
        },
      ]);
    });

    it('adds a text prompt to the end of the list', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'},
      ];
      const newState = spritelabInputList(
        state,
        addTextPrompt('promptText', 'variableName')
      );
      expect(newState).toEqual([
        ...state,
        {
          promptType: PromptType.TEXT,
          promptText: 'promptText',
          variableName: 'variableName',
        },
      ]);
    });
  });

  describe('addMultipleChoicePrompt', () => {
    const addMultipleChoicePrompt = spritelabInput.addMultipleChoicePrompt;
    it('adds a multiple choice prompt to an empty list', () => {
      const state = [];
      const newState = spritelabInputList(
        state,
        addMultipleChoicePrompt('promptText', 'variableName', [
          'choice1',
          'choice2',
        ])
      );
      expect(newState).toEqual([
        {
          promptType: PromptType.MULTIPLE_CHOICE,
          promptText: 'promptText',
          variableName: 'variableName',
          choices: ['choice1', 'choice2'],
        },
      ]);
    });

    it('adds a multiple choice prompt to the end of the list', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'},
      ];
      const newState = spritelabInputList(
        state,
        addMultipleChoicePrompt('promptText', 'variableName', [
          'choice1',
          'choice2',
          'choice3',
        ])
      );
      expect(newState).toEqual([
        ...state,
        {
          promptType: PromptType.MULTIPLE_CHOICE,
          promptText: 'promptText',
          variableName: 'variableName',
          choices: ['choice1', 'choice2', 'choice3'],
        },
      ]);
    });
  });

  describe('popPrompt', () => {
    const popPrompt = spritelabInput.popPrompt;
    it('gracefully handles empty list', () => {
      const state = [];
      const newState = spritelabInputList(state, popPrompt());
      expect(newState).toEqual([]);
    });
    it('removes the first prompt from the list', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'},
      ];
      const newState = spritelabInputList(state, popPrompt());
      expect(newState).toEqual([
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'},
      ]);
    });
  });

  describe('clearPrompts', () => {
    const clearPrompts = spritelabInput.clearPrompts;
    it('returns []', () => {
      const state = [
        {promptType: PromptType.TEXT, promptText: 'first'},
        {promptType: PromptType.MULTIPLE_CHOICE, promptText: 'second'},
      ];
      const newState = spritelabInputList(state, clearPrompts());
      expect(newState).toEqual([]);
    });
  });
});
