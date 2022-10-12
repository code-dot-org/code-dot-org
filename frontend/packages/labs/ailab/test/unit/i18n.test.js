import I18n from '../../src/i18n';
import MessageFormat from "messageformat";

let testTranslations = new MessageFormat('en').compile({
  "hello": "hello {name}"
});

describe('I18n.t', () => {
  test('throws error when called before initialized', async () => {
    expect(() => {
      I18n.reset();
      I18n.t("hello");
    }).toThrow();
  });

  test('returns expected string', async () => {
    I18n.reset();
    I18n.initI18n(testTranslations);
    expect(I18n.t("hello", {"name": "test"})).toEqual("hello test");
  });
});
