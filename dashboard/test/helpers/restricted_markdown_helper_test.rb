require 'test_helper'

class RestrictedMarkdownHelperTest < ActionView::TestCase
  include RestrictedMarkdownHelper

  test "strips formatting like bold and italics" do
    markdown = "*This* _restricted_ formatting is ignored"
    expected = "This restricted formatting is ignored"
    assert_equal expected, render_restricted_markdown(markdown)
  end

  test "strips html" do
    markdown = "This has <strong>HTML</strong> in it"
    expected = "This has HTML in it"
    assert_equal expected, render_restricted_markdown(markdown)
  end

  test "does not strip backticks" do
    markdown = "I want to format some `code`"
    expected = "I want to format some <code>code</code>"
    assert_equal expected, render_restricted_markdown(markdown)
  end
end
