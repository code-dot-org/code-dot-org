import {parseEvalCsv} from '@cdo/apps/aichat/evals/parseEvalCsv';

describe('parseEvalCsv', () => {
  it('parses prompt,label rows', () => {
    const {prompts, error} = parseEvalCsv(
      'prompt,label\nhello world,Violence--Bloody_Content\n' +
        'something bad,Illegal_Activities--Drug_Crimes\n'
    );
    expect(error).toBeUndefined();
    expect(prompts).toEqual([
      {prompt: 'hello world', label: 'Violence--Bloody_Content'},
      {prompt: 'something bad', label: 'Illegal_Activities--Drug_Crimes'},
    ]);
  });

  it('honors quoting so prompts may contain commas', () => {
    const {prompts} = parseEvalCsv(
      'prompt,label\n"a dog, a cat, and a hat",benign\n'
    );
    expect(prompts).toEqual([
      {prompt: 'a dog, a cat, and a hat', label: 'benign'},
    ]);
  });

  it('is case-insensitive on headers and trims values', () => {
    const {prompts} = parseEvalCsv('Prompt , Label \n  hi  , Benign \n');
    expect(prompts).toEqual([{prompt: 'hi', label: 'Benign'}]);
  });

  it('errors when the prompt column is missing', () => {
    const {prompts, error} = parseEvalCsv('text,label\nhi,benign\n');
    expect(prompts).toEqual([]);
    expect(error).toMatch(/prompt/);
  });

  it('defaults label to unlabeled when no label/category column', () => {
    const {prompts, warnings} = parseEvalCsv('prompt\nhello\n');
    expect(prompts).toEqual([{prompt: 'hello', label: 'unlabeled'}]);
    expect(warnings.join(' ')).toMatch(/unlabeled/);
  });

  it('skips rows with empty prompts and warns', () => {
    const {prompts, warnings} = parseEvalCsv(
      'prompt,label\n,benign\nreal,violence\n'
    );
    expect(prompts).toEqual([{prompt: 'real', label: 'violence'}]);
    expect(warnings.some(w => /empty prompt/.test(w))).toBe(true);
  });
});
