import {generatorInputsChanged} from '@cdo/apps/levelbuilder/lesson-generator/helpers/generatorPrompts';
import {LevelSpec} from '@cdo/apps/levelbuilder/lesson-generator/types';

describe('generatorInputsChanged', () => {
  const saved: LevelSpec = {
    key: 'k',
    id: 'build',
    labType: 'pythonlab',
    description: 'Build it.',
    lastGeneratedDescription: 'Build it.',
    suppliedCode: 'x = 1',
    lastGeneratedSuppliedCode: 'x = 1',
    generate: false,
  };

  it('is true for a card that was never saved', () => {
    expect(
      generatorInputsChanged({...saved, lastGeneratedDescription: undefined})
    ).toBe(true);
  });

  it('is false while both prompts match the last save', () => {
    expect(generatorInputsChanged(saved)).toBe(false);
    expect(generatorInputsChanged({...saved, description: ' Build it. '})).toBe(
      false
    );
  });

  it('is true when either prompt changes', () => {
    expect(generatorInputsChanged({...saved, description: 'Rebuild it.'})).toBe(
      true
    );
    expect(generatorInputsChanged({...saved, suppliedCode: 'x = 2'})).toBe(
      true
    );
    expect(generatorInputsChanged({...saved, suppliedCode: ''})).toBe(true);
  });
});
