import {extractTextFromCode} from '@cdo/apps/code-studio/components/libraries/utils';

import {expect} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('extractTextFromCode', () => {
  it('extracts string literals with double quotes', () => {
    const code = 'console.log("Hello World");';
    const result = extractTextFromCode(code);
    expect(result).to.equal('Hello World console log');
  });

  it('extracts string literals with single quotes', () => {
    const code = "console.log('Hello World');";
    const result = extractTextFromCode(code);
    expect(result).to.equal('Hello World console log');
  });

  it('extracts string literals with template literals', () => {
    const code = 'console.log(`Hello World`);';
    const result = extractTextFromCode(code);
    expect(result).to.equal('Hello World console log');
  });

  it('extracts single-line comments', () => {
    const code = '// This is a comment';
    const result = extractTextFromCode(code);
    expect(result).to.equal('This is a comment');
  });

  it('extracts multi-line comments', () => {
    const code = '/* This is a\nmulti-line comment */';
    const result = extractTextFromCode(code);
    expect(result).to.equal('This is a\nmulti-line comment');
  });

  it('extracts identifiers that are 2 or more characters', () => {
    const code = 'let myVar = 1;';
    const result = extractTextFromCode(code);
    expect(result).to.equal('let myVar');
  });

  it('does not extract single-character identifiers', () => {
    const code = 'let x = 1;';
    const result = extractTextFromCode(code);
    expect(result).to.not.include('x');
  });

  it('removes parentheses that affect tokenization', () => {
    const code = 'if(artistList[i]) == artist';
    const result = extractTextFromCode(code);
    expect(result).to.equal('if artistList artist');
    expect(result).to.not.include('if(artlistList');
  });

  it('removes brackets that affect tokenization', () => {
    const code = 'arr[0] = "test";';
    const result = extractTextFromCode(code);
    expect(result).to.not.include('[');
    expect(result).to.not.include(']');
  });

  it('removes braces that affect tokenization', () => {
    const code = 'function test() { return "hello"; }';
    const result = extractTextFromCode(code);
    expect(result).to.not.include('{');
    expect(result).to.not.include('}');
  });

  it('keeps asterisks for profanity obfuscation detection', () => {
    const code = 'console.log("f*ck");';
    const result = extractTextFromCode(code);
    expect(result).to.equal('f*ck console log');
  });

  it('keeps @ symbol for profanity obfuscation detection', () => {
    const code = 'console.log("sh@t");';
    const result = extractTextFromCode(code);
    expect(result).to.equal('sh@t console log');
  });

  it('keeps ! symbol for profanity obfuscation detection', () => {
    const code = 'console.log("d!ck");';
    const result = extractTextFromCode(code);
    expect(result).to.equal('d!ck console log');
  });

  it('extracts text from complex code with multiple elements', () => {
    const code = `
      // Check user input
      function validateInput(text) {
        let result = "invalid";
        return result;
      }
    `;
    const result = extractTextFromCode(code);
    expect(result).to.equal(
      'Check user input invalid function validateInput text let result return result'
    );
  });

  it('handles empty string', () => {
    const result = extractTextFromCode('');
    expect(result).to.equal('');
  });

  it('handles null input', () => {
    const result = extractTextFromCode(null);
    expect(result).to.equal('');
  });

  it('handles undefined input', () => {
    const result = extractTextFromCode(undefined);
    expect(result).to.equal('');
  });

  it('extracts identifiers with numbers', () => {
    const code = 'let num1 = 5; let var2 = 10;';
    const result = extractTextFromCode(code);
    expect(result).to.equal('let num1 let var2');
  });

  it('keeps underscores in identifiers for obfuscation detection', () => {
    const code = 'let my_var = 5; let sh_t = 10;';
    const result = extractTextFromCode(code);
    expect(result).to.equal('let my_var let sh_t');
  });

  it('removes semicolons and commas', () => {
    const code = 'let a = 1, b = 2;';
    const result = extractTextFromCode(code);
    expect(result).to.not.include(';');
    expect(result).to.not.include(',');
  });

  it('unescapes common escape sequences in strings', () => {
    const code = 'let msg = "Hello\\nWorld";';
    const result = extractTextFromCode(code);
    expect(result).to.equal('Hello World let msg');
  });
});
