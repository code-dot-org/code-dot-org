import {
  dslHeredoc,
  dslQuote,
} from '@cdo/apps/levelbuilder/lesson-generator/ai/dsl';

describe('dslQuote', () => {
  it('escapes single quotes and backslashes', () => {
    expect(dslQuote("it's a \\ path")).toBe("'it\\'s a \\\\ path'");
  });
});

describe('dslHeredoc', () => {
  it('wraps the body in a MARKDOWN heredoc', () => {
    expect(dslHeredoc('hello')).toBe('<<MARKDOWN\nhello\nMARKDOWN');
  });

  it('picks a terminator absent from the body', () => {
    expect(dslHeredoc('mentions MARKDOWN inline')).toContain('<<MARKDOWN_1\n');
  });

  it('escapes interpolation and backslashes for the Ruby heredoc', () => {
    // The DSL file is instance_eval'd, so an unescaped #{…} would run.
    expect(dslHeredoc('puts "#{name}" in C:\\temp')).toBe(
      '<<MARKDOWN\nputs "\\#{name}" in C:\\\\temp\nMARKDOWN'
    );
  });
});
