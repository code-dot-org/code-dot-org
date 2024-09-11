import utils from '@cdo/apps/code-studio/pd/form_components/utils';

describe('FormComponents Utils', () => {
  it('normalizes SimpleAnswer to Answer', () => {
    const input = 'simple answer';
    const output = utils.normalizeAnswer(input);
    const expected = {
      answerText: 'simple answer',
      answerValue: 'simple answer',
    };
    expect(output).toEqual(expected);
  });

  it('normalizes Answer to Answer', () => {
    const input = {
      answerText: 'display text',
      answerValue: 'form value',
    };
    const output = utils.normalizeAnswer(input);
    expect(output).toEqual(input);
  });

  it('explicitly defines optional answerValue if left undefined', () => {
    const input = {
      answerText: 'display text',
    };
    const expected = {
      answerText: 'display text',
      answerValue: 'display text',
    };
    const output = utils.normalizeAnswer(input);
    expect(output).toEqual(expected);
  });
});
