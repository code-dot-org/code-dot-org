require_relative './test_helper'
require_relative '../src/env'
require_relative '../helpers/page_helpers'
require 'minitest/autorun'

class PageHelpersTest < Minitest::Test
  def test_hacky_localized_lesson_plan_url
    # method will generate locale-aware link for supported languages
    I18n.locale = :"es-MX"
    assert_equal hacky_localized_lesson_plan_url("/test"),
      "https://curriculum.code.org/es-mx/test"

    # method will generate locale-aware link for additional languages
    I18n.locale = :"fr-FR"
    assert_equal hacky_localized_lesson_plan_url("test"),
      "https://curriculum.code.org/fr-fr/test"

    # method will generate unmodified link for unknown languages
    I18n.locale = :"fa-KE"
    assert_equal hacky_localized_lesson_plan_url("test"),
      "https://curriculum.code.org/test"
  end
end
