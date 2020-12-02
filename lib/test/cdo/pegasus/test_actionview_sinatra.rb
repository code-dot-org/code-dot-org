require_relative '../../test_helper'
require 'cdo/pegasus/actionview_sinatra'

class ActionViewSinatraTest < Minitest::Test
  def setup
    @actionview = ActionViewSinatra::Base.new(self)
    @locals = {variable: 'headline'}
  end

  def test_erb
    assert_equal "<h1>headline</h1>", @actionview.render(inline: '<h1><%= variable %></h1>', type: :erb, locals: @locals)
  end

  def test_haml
    assert_equal "<h1>headline</h1>\n", @actionview.render(inline: '%h1= variable', type: :haml, locals: @locals)
  end

  def test_markdown
    assert_equal "<h1>headline</h1>\n", @actionview.render(inline: '# headline', type: :md)
  end

  def test_markdown_brackets_to_div_classes
    markdown = "[classname]\n\nMy Text\n\n[/classname]"
    expected = "<div class='classname'>\n\n<p>My Text</p>\n\n</div>\n"
    assert_equal expected, @actionview.render(inline: markdown, type: :md)
  end
end
