require_relative '../../test_helper'
require_relative '../../../i18n/translation_monitor/core_validator'

class CoreValidatorTest < Minitest::Test
  include CoreValidator

  def test_validate_markdown_link
    # valid cases
    assert_nil validate_markdown_link('[text](url)')
    assert_nil validate_markdown_link('[.](http://go.somewhere)')

    # a valid special case
    assert_nil validate_markdown_link("[][0] (this is just an explanation)")

    # invalid cases
    refute_nil validate_markdown_link('[text] (url)')
    refute_nil validate_markdown_link("[text]\t(url)")
  end

  def test_validate_redacted_blocks
    # valid cases
    assert_nil validate_redacted_blocks('[A][0]')
    assert_nil validate_redacted_blocks('[A][0][B][1]')
    assert_nil validate_redacted_blocks('[A][0] [B][1]')
    assert_nil validate_redacted_blocks('[A][0]  [B][1]  [C][2]')
    assert_nil validate_redacted_blocks('[][0][][1]')
    assert_nil validate_redacted_blocks('[][0] [][1]')
    assert_nil validate_redacted_blocks("[][0]  [][1]  [][2]")

    # invalid cases
    refute_nil validate_redacted_blocks('[A] [0]')
    refute_nil validate_redacted_blocks("[A]\t[0]")
    refute_nil validate_redacted_blocks("[] [0]")
    refute_nil validate_redacted_blocks("[]\t[0]")
    refute_nil validate_redacted_blocks('[] []')
  end

  def test_validate_language
    # valid cases
    assert_nil validate_language("this is a sentence in english", 'en')
    assert_nil validate_language("esta es una oracion en español", 'es')
    assert_nil validate_language("c'est une phrase en français", 'fr')
    assert_nil validate_language("これは日本語の文章です", 'ja')
    assert_nil validate_language("đây là một câu trong tiếng việt", 'vi')
    assert_nil validate_language("هذه جملة باللغة العربية", 'ar')

    # cases we cannot detect languages reliably
    assert_nil validate_language("1 2 3 4 5 6 7 8 9 10 11", 'any_language_code')
    assert_nil validate_language("string too short", 'any_language_code')
    assert_nil validate_language("", 'any_language_code')

    # invalid cases
    refute_nil validate_language("இது தமிழில் ஒரு சோதனை வாக்கியம்", 'it')
    refute_nil validate_language("ini adalah kalimat dalam bahasa indonesia", 'es')
  end
end
