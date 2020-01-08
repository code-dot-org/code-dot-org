require_relative '../../test_helper'
require 'cdo/redcarpet/inline'

class RedcarpetInlineRendererTest < Minitest::Test
  def setup
    @renderer = Redcarpet::Markdown.new(Redcarpet::Render::Inline)
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
    assert_equal "some basic inline",
      @renderer.render("<strong>some</strong> <em>basic</em> <a href=\"markdown\">inline</a>")

    assert_equal "<strong>mixed</strong> html <em>and</em> markdown",
      @renderer.render("**mixed** <i>html</i> _and_ <strong>markdown</strong>")

    assert_equal "", @renderer.render("<table><thead><th>Some advanced html</th><th><strong>not</strong> usually supported by markdown</th></thead></table>\n")
  end
end
