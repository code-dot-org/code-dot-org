require 'test_helper'

class ApplicationTest < ActiveSupport::TestCase
  test 'untranslated i18n strings fall back to english' do
    # First, load string into English
    english_strings = {
      "data" => {
        "test" => {
          "example": "english"
        }
      }
    }
    I18n.backend.store_translations I18n.default_locale, english_strings
    assert_equal I18n.t("data.test.example"), "english"

    # Second, verify that we get the English string back even from another
    # locale
    test_locale = :"te-ST"
    I18n.locale = test_locale
    assert_equal I18n.t("data.test.example"), "english"

    # Third, load a translation in and verify that we now get the translation
    # back rather than English.
    translated_strings = {
      "data" => {
        "test" => {
          "example": "translated"
        }
      }
    }
    I18n.backend.store_translations test_locale, translated_strings
    assert_equal I18n.t("data.test.example"), "translated"
  end
end
