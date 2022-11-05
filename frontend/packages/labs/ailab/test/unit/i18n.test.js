import I18n from '../../src/i18n';
import MessageFormat from "messageformat";

let testTranslations = new MessageFormat('en').compile({
  "hello": "hello {name}",
  "simple": "simpleValue",
  "nested": {
    "one": {
      "two": {
        "three": "3"
      }
    }
  }
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

  describe('with default', () => {
    test('returns default when string not found', async () => {
      I18n.reset();
      I18n.initI18n(testTranslations);
      expect(I18n.t("keyDoesNotExist", {"default": "testDefault"}))
        .toEqual("testDefault");
    });

    test('returns string given good key', async () => {
      I18n.reset();
      I18n.initI18n(testTranslations);
      expect(I18n.t("simple", {"default": "testDefault"}))
        .toEqual("simpleValue");
    });
  });

  describe('with scope', () => {
    test('returns undefined given shallow scope', async () => {
      I18n.reset();
      I18n.initI18n(testTranslations);
      expect(I18n.t("three", {"scope": ["nested", "one"]}))
        .toEqual(undefined);
    });

    test('returns undefined given incorrect scope', async () => {
      I18n.reset();
      I18n.initI18n(testTranslations);
      expect(I18n.t("three", {"scope": ["nested", "two", "one"]}))
        .toEqual(undefined);
    });

    test('returns "three" given correct scope', async () => {
      I18n.reset();
      I18n.initI18n(testTranslations);
      expect(I18n.t("three", {"scope": ["nested", "one", "two"]}))
        .toEqual("3");
    });
  });
});
