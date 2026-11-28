const {
  replaceRule,
} = require('../../../dashboard/public/text-compression/replaceRule');

describe('text-compression replaceRule', () => {
  it('replaces every occurrence of the rule, ignoring case', () => {
    expect(replaceRule('Tooter to TOOT the toot', 'toot', '#')).toBe(
      '#er to # the #'
    );
  });

  it('treats regex metacharacters in the rule literally', () => {
    expect(replaceRule('a.b a+b axb', 'a.b', '#')).toBe('# a+b axb');
    expect(replaceRule('(x)* [y]', '(x)*', '#')).toBe('# [y]');
  });

  it('leaves the text alone when the rule is empty', () => {
    expect(replaceRule('abc', '', '#')).toBe('abc');
  });

  describe('when the engine rejects very large regular expressions', () => {
    const OriginalRegExp = global.RegExp;
    const ENGINE_LIMIT = 100000;

    beforeEach(() => {
      global.RegExp = function (pattern, flags) {
        if (String(pattern).length > ENGINE_LIMIT) {
          throw new SyntaxError(
            `Invalid regular expression: /${pattern}/${flags}: Regular expression too large`
          );
        }
        return new OriginalRegExp(pattern, flags);
      };
    });

    afterEach(() => {
      global.RegExp = OriginalRegExp;
    });

    it('does not throw for a rule longer than the text', () => {
      const text = 'short text';
      const rule = 'sdfghjk'.repeat(50000);
      expect(replaceRule(text, rule, '#')).toBe(text);
    });
  });
});
