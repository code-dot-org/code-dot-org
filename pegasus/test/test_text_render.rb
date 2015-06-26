require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class TextRenderTest < Minitest::Unit::TestCase
  include TextRender

  def test_erb
    assert_equal "<h1>headline</h1>", TextRender.r(ErbEngine,'<h1><%= variable %></h1>', variable:'headline')
  end

  def test_haml
    assert_equal "<h1>headline</h1>\n", TextRender.r(HamlEngine,'%h1= variable', variable:'headline')
  end

  def test_markdown
    assert_equal "<h1>headline</h1>\n", TextRender.r(MarkdownEngine,'# <%= variable %>', variable:'headline')
  end

  def test_yaml
    assert_equal 'headline', TextRender.r(YamlEngine,'yaml_variable: <%= variable %>', variable:'headline')['yaml_variable']
  end

end
