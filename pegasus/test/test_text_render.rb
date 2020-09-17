require_relative '../src/text_render'
require 'minitest/autorun'

class TextRenderTest < Minitest::Test
  include TextRender

  def test_erb
    assert_equal "<h1>headline</h1>", TextRender.r(ErbEngine, '<h1><%= variable %></h1>', variable: 'headline')
  end

  def test_haml
    assert_equal "<h1>headline</h1>\n", TextRender.r(HamlEngine, '%h1= variable', variable: 'headline')
  end

  def test_markdown
    assert_equal "<h1>headline</h1>\n", TextRender.r(MarkdownEngine, '# <%= variable %>', variable: 'headline')
  end

  def test_markdown_brackets_to_div_classes
    assert_renders "[classname]\n\nMy Text\n\n[/classname]",
      "<div class='classname'>\n\n<p>My Text</p>\n\n</div>\n"
  end

  def test_markdown_details_wrapped_in_divs
    assert_renders "<details>\n\n<summary>My Summary</summary>\n\n</details>",
      "<div><details>\n\n<summary>My Summary</summary>\n\n</details></div>\n"
  end

  def test_markdown_details_doesnt_chomp_trailing_bracket_tags
    assert_renders "<details>\n\n<summary>My Summary</summary>\n\n</details>\n\n[mycooltag]\n",
      "<div><details>\n\n<summary>My Summary</summary>\n\n</details></div>\n\n<div class='mycooltag'>\n"
  end

  def assert_renders(pre_render, post_render)
    assert_equal post_render, TextRender.r(MarkdownEngine, pre_render)
  end

  def test_yaml
    assert_equal 'headline', TextRender.r(YamlEngine, 'yaml_variable: <%= variable %>', variable: 'headline')['yaml_variable']
  end
end
