require_relative '../../test_helper'
require 'cdo/redcarpet/inline'

class RedcarpetInlineRendererTest < Minitest::Test
  def setup
    @renderer = Redcarpet::Markdown.new(Redcarpet::Render::Inline)
    @filter_html_renderer = Redcarpet::Markdown.new(Redcarpet::Render::Inline.new(filter_html: true))
  end

  def test_base
    assert_equal "base string", @renderer.render("base string")
  end

  def test_inline_markdown
    expected = "a <strong>string</strong> with <em>some</em> <a href=\"markdown\">basic</a>"
    markdown = "a **string** with _some_ [basic](markdown)"
    assert_equal expected, @renderer.render(markdown)
  end

  def test_paragraph
    expected = "<strong>some</strong> <em>basic</em> <a href=\"markdown\">inline</a>and <strong>yet more</strong> markdown in a <em>second</em> paragraph"
    markdown = "**some** _basic_ [inline](markdown)\n\nand **yet more** markdown in a _second_ paragraph"
    assert_equal expected, @renderer.render(markdown)
  end

  def test_header
    assert_equal "header", @renderer.render("# header")
  end

  def test_blockquote
    assert_equal "blockquote", @renderer.render("> blockquote")
  end

  def test_list
    assert_equal "an\nunordered\nlist\n", @renderer.render("- an\n- unordered\n- list")
    assert_equal "an\nordered\nlist\n", @renderer.render("1. an\n2. ordered\n3. list")
  end

  def test_raw_html
    advanced_html = "<table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>\n"
    basic_html = "<strong>some</strong> <em>basic</em> <a href=\"markdown\">inline</a>"
    mixed_html = "**mixed** <i>html</i> _and_ <strong>markdown</strong>"

    # The renderer will refuse to render HTML with initialied with 'filter_html' option
    assert_equal "some basic inline", @filter_html_renderer.render(basic_html)
    assert_equal "<strong>mixed</strong> html <em>and</em> markdown", @filter_html_renderer.render(mixed_html)
    assert_equal "Some advanced htmlnot usually supported by markdown", @filter_html_renderer.render(advanced_html)

    # The renderer will allow html otherwise
    assert_equal basic_html, @renderer.render(basic_html)
    assert_equal "<strong>mixed</strong> <i>html</i> <em>and</em> <strong>markdown</strong>",
      @renderer.render("**mixed** <i>html</i> _and_ <strong>markdown</strong>")
    assert_equal advanced_html, @renderer.render(advanced_html)
  end
end
