require_relative '../test_helper'
require 'cdo/i18n_backend'

class I18nSmartTranslateTest < Minitest::Test
  def test_get_valid_separator
    test_strings = Cdo::I18nSmartTranslate::SEPARATORS.map do |separator|
      "some#{separator}string"
    end

    # will return a separator not in the original string
    test_strings.each do |test_string|
      separator = Cdo::I18nSmartTranslate.get_valid_separator test_string
      refute test_string.include? separator
    end

    # can accomodate strings that include multiple possible separators
    test_strings.each do |first_string|
      test_strings.each do |second_string|
        test_string = first_string + second_string
        separator = Cdo::I18nSmartTranslate.get_valid_separator test_string
        refute test_string.include? separator
      end
    end

    # cannot accomodate strings that include all possible separators
    all_test_string = test_strings.join('')
    assert_nil Cdo::I18nSmartTranslate.get_valid_separator all_test_string
  end

  def test_get_smart_translate_options
    locale = :'te-ST'
    key = "locale.key"

    # can smartly find a valid separator if given an explicit scope
    scope_options = {scope: ["some", "scope", "with", "a|pipe"]}
    smart_options = Cdo::I18nSmartTranslate.get_smart_translate_options(locale, key, scope_options)
    assert_equal ",", smart_options[:separator]

    # will not attempt to find a separator if explicitly given a separator
    scope_options[:separator] = '.'
    smart_options = Cdo::I18nSmartTranslate.get_smart_translate_options(locale, key, scope_options)
    assert_equal ".", smart_options[:separator]

    # will not attempt to find a separator unless given a scope
    smart_options = Cdo::I18nSmartTranslate.get_smart_translate_options(locale, key)
    assert_equal nil, smart_options[:separator]
  end
end
