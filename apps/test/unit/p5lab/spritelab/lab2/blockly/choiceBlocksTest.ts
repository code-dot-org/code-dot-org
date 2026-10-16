jest.mock('blockly/core', () => ({
  FieldDropdown: class {},
  getMainWorkspace: () => null,
}));

import showChoices, {
  choicesOf,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/showChoices';
import whenChoice, {
  choiceMenuOptions,
} from '@cdo/apps/p5lab/spritelab/lab2/blockly/blockDefinitions/whenChoice';

const fields = (values: Record<string, string>) => (name: string) =>
  values[name] ?? null;

describe('show choices', () => {
  it('generates the typed choices in order, blanks left out', () => {
    const block = {
      getFieldValue: fields({CHOICE1: 'Yes', CHOICE2: ' ', CHOICE3: 'Maybe'}),
    };
    expect(showChoices.generator(block as never, null as never)).toBe(
      'showChoices(["Yes","Maybe"]);\n'
    );
    expect(choicesOf(fields({}))).toEqual([]);
  });
});

describe('when choice', () => {
  it("offers every choice typed on the program's show-choices blocks, once", () => {
    expect(
      choiceMenuOptions([
        {getFieldValue: fields({CHOICE1: 'Yes', CHOICE2: 'No'})},
        {getFieldValue: fields({CHOICE1: 'No', CHOICE2: 'Later', CHOICE3: ''})},
      ])
    ).toEqual([
      ['Yes', 'Yes'],
      ['No', 'No'],
      ['Later', 'Later'],
    ]);
    expect(choiceMenuOptions([])).toEqual([['(add show choices first)', '']]);
  });

  it('generates the handler for its choice', () => {
    const block = {getFieldValue: () => 'Yes'};
    const generator = {statementToCode: () => '  go();\n'};
    expect(whenChoice.generator(block as never, generator as never)).toBe(
      'whenChoice("Yes", function () {\n  go();\n});\n'
    );
  });
});
