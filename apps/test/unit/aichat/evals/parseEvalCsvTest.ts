import {parseEvalCsv} from '@cdo/apps/aichat/evals/parseEvalCsv';

describe('parseEvalCsv', () => {
  it('parses prompt,category rows', () => {
    const {prompts, error} = parseEvalCsv(
      'prompt,category\nhello world,benign\nsomething bad,violence\n'
    );
    expect(error).toBeUndefined();
    expect(prompts).toEqual([
      {prompt: 'hello world', category: 'benign'},
      {prompt: 'something bad', category: 'violence'},
    ]);
  });

  it('honors quoting so prompts may contain commas', () => {
    const {prompts} = parseEvalCsv(
      'prompt,category\n"a dog, a cat, and a hat",benign\n'
    );
    expect(prompts).toEqual([
      {prompt: 'a dog, a cat, and a hat', category: 'benign'},
    ]);
  });

  it('is case-insensitive on headers and trims values', () => {
    const {prompts} = parseEvalCsv('Prompt , Category \n  hi  , Benign \n');
    expect(prompts).toEqual([{prompt: 'hi', category: 'Benign'}]);
  });

  it('errors when the prompt column is missing', () => {
    const {prompts, error} = parseEvalCsv('text,category\nhi,benign\n');
    expect(prompts).toEqual([]);
    expect(error).toMatch(/prompt/);
  });

  it('defaults category to uncategorized when the column is absent', () => {
    const {prompts, warnings} = parseEvalCsv('prompt\nhello\n');
    expect(prompts).toEqual([{prompt: 'hello', category: 'uncategorized'}]);
    expect(warnings.join(' ')).toMatch(/uncategorized/);
  });

  it('skips rows with empty prompts and warns', () => {
    const {prompts, warnings} = parseEvalCsv(
      'prompt,category\n,benign\nreal,violence\n'
    );
    expect(prompts).toEqual([{prompt: 'real', category: 'violence'}]);
    expect(warnings.some(w => /empty prompt/.test(w))).toBe(true);
  });
});
