require_relative '../test_helper'
require 'cdo/i18n_backend'

class TestI18nSmartTranslateBackend < ::I18n::Backend::Simple
  include Cdo::I18n::SmartTranslate
end

class I18nSmartTranslateTest < Minitest::Test
  def test_get_valid_separator
    test_strings = Cdo::I18n::SmartTranslate::SEPARATORS.map do |separator|
      "some#{separator}string"
    end

    # will return a separator not in the original string
    test_strings.each do |test_string|
      separator = Cdo::I18n::SmartTranslate.get_valid_separator test_string
      refute test_string.include? separator
      refute_nil separator
    end

    # can accomodate strings that include multiple possible separators
    test_strings.each do |first_string|
      test_strings.each do |second_string|
        test_string = first_string + second_string
        separator = Cdo::I18n::SmartTranslate.get_valid_separator test_string
        refute test_string.include? separator
        refute_nil separator
      end
    end

    # cannot accomodate strings that include all possible separators
    all_test_string = test_strings.join('')
    assert_nil Cdo::I18n::SmartTranslate.get_valid_separator all_test_string
  end

  def test_get_smart_translate_options
    locale = :'te-ST'
    key = "locale.key"

    # can smartly find a valid separator if given an explicit scope
    scope_options = {scope: ["some", "scope", "with", "a|pipe"]}
    smart_options = Cdo::I18n::SmartTranslate.get_smart_translate_options(locale, key, scope_options)
    assert_equal ",", smart_options[:separator]

    # will not attempt to find a separator if explicitly given a separator
    scope_options[:separator] = '.'
    smart_options = Cdo::I18n::SmartTranslate.get_smart_translate_options(locale, key, scope_options)
    assert_equal ".", smart_options[:separator]

    # will not attempt to find a separator unless given a scope
    smart_options = Cdo::I18n::SmartTranslate.get_smart_translate_options(locale, key)
    assert_nil smart_options[:separator]
  end

  def test_smart_translate_option_not_passed_to_super
    test_locale = :'te-ST'
    backend = TestI18nSmartTranslateBackend.new
    backend.store_translations(test_locale, test_interpolation: "test %{smart}")
    assert_equal "test %{smart}", backend.translate(test_locale, :test_interpolation, smart: true)
  end

  def test_smart_translate
    test_locale = :'te-ST'
    backend = TestI18nSmartTranslateBackend.new

    # with smart translate, we can successfully retrieve translations that use periods as keys
    period_separated_i18n = {
      "data" => {
        "some.keys" => {
          "with.periods" => "translation"
        }
      }
    }

    backend.store_translations test_locale, period_separated_i18n
    assert_nil backend.translate(test_locale, "with.periods", {scope: [:data, "some.keys"], default: nil})
    assert_equal "translation", backend.translate(test_locale, "with.periods", {scope: [:data, "some.keys"], default: nil, smart: true})

    # we can also retrieve translations that use other separator characters
    multi_separated_i18n = {
      "data" => {
        "some.keys" => {
          "with|a,variety" => {
            "of-separators": "translation"
          }
        }
      }
    }

    backend.store_translations test_locale, multi_separated_i18n
    assert_nil backend.translate(test_locale, "of-separators", {scope: [:data, "some.keys", "with|a,variety"], default: nil})
    assert_equal "translation", backend.translate(test_locale, "of-separators", {scope: [:data, "some.keys", "with|a,variety"], default: nil, smart: true})

    # if we attempt to retrieve a translation that uses _all_ of our separator
    # characters, we simply fall back to using the default separator which
    # means we will be unable to find the string.
    all_separated_i18n = {
      "data" => {
        "some.keys" => {
          "with|all,of-the" => {
            "separators_that we/support": "translation"
          }
        }
      }
    }

    backend.store_translations test_locale, all_separated_i18n
    assert_nil backend.translate(test_locale, "separators_that we/support", {scope: [:data, "some.keys", "with|all,of-the"], default: nil})
    assert_nil backend.translate(test_locale, "separators_that we/support", {scope: [:data, "some.keys", "with|all,of-the"], default: nil, smart: true})
  end
end

class TestI18nMarkdownTranslateBackend < ::I18n::Backend::Simple
  include Cdo::I18n::MarkdownTranslate
end

class I18nMarkdownTranslateTest < Minitest::Test
  def test_markdown_translate_option_not_passed_to_super
    test_locale = :'te-ST'
    backend = TestI18nMarkdownTranslateBackend.new
    backend.store_translations(test_locale, test_interpolation: "test %{markdown}")
    assert_equal "test %{markdown}", backend.translate(test_locale, :test_interpolation, markdown: false)
  end
end

class TestI18nSafeInterpolationBackend < ::I18n::Backend::Simple
  include Cdo::I18n::SafeInterpolation
end

class I18nSafeInterpolationTest < Minitest::Test
  def setup
    @locale = :'te-ST'
    @backend = TestI18nSafeInterpolationBackend.new
  end

  def test_string_can_render_with_missing_interpolation_argument
    @backend.store_translations(
      @locale,
      test_missing_interpolation_argument: "Hello %{world}"
    )

    assert_equal "Hello %{world}", @backend.translate(@locale, 'test_missing_interpolation_argument')
  end

  def test_string_can_render_with_some_missing_interpolation_arguments
    @backend.store_translations(
      @locale,
      test_missing_interpolation_argument: "%{hello} %{world}"
    )

    assert_equal "%{hello} %{world}", @backend.translate(@locale, 'test_missing_interpolation_argument')
    assert_equal "Hello %{world}", @backend.translate(@locale, 'test_missing_interpolation_argument', hello: "Hello")
    assert_equal "%{hello} World", @backend.translate(@locale, 'test_missing_interpolation_argument', world: "World")
  end

  def test_missing_interpolation_arguments_are_logged
    @backend.store_translations(
      @locale,
      test_missing_interpolation_argument: "Hello %{world}"
    )

    Honeybadger.expects(:notify)
    @backend.translate(@locale, 'test_missing_interpolation_argument')
  end
end
