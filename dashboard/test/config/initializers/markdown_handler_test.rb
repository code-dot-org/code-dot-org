require 'test_helper'

class MarkdownHandlerTest < ActionView::TestCase
  def setup
    @actionview = ActionView::Base.new
  end

  test 'links open in new tabs by default' do
    markdown = "[test](link)"
    expected = "<p><a target='_blank' href='link' title=''>test</a></p>\n"
    assert_equal expected, @actionview.render(inline: markdown, type: :md)
  end

  test 'autolinks open in new tabs by default' do
    markdown = "http://example.com"
    expected = "<p><a target='_blank' href='http:&#x2F;&#x2F;example.com' title=''>http://example.com</a></p>\n"
    assert_equal expected, @actionview.render(inline: markdown, type: :md)
  end

  test 'youtube iframe elements use fallback player' do
    markdown = "<iframe src='http://youtube.com/embed/samplevideo'></iframe>"
    expected = "<iframe src=\"//test-studio.code.org/videos/embed/samplevideo\"></iframe>\n"
    assert_equal expected, @actionview.render(inline: markdown, type: :md)
  end
end
