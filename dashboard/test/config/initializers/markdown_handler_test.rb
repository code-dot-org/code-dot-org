require 'test_helper'

class MarkdownHandlerTest < ActiveSupport::TestCase
  test 'basic ActiveRecord markdown support' do
    markdown = "a **simple** string with _markdown formatting_"
    expected = "<p>a <strong>simple</strong> string with <em>markdown formatting</em></p>\n"
    actual = ActionView::Base.new.render(inline: markdown, type: :md)
    assert_equal expected, actual
  end

  test 'markdown supports autolink' do
    markdown = "<https://code.org>"
    expected = "<p><a href=\"https://code.org\">https://code.org</a></p>\n"
    actual = ActionView::Base.new.render(inline: markdown, type: :md)
    assert_equal expected, actual
  end

  test 'markdown supports tables' do
    markdown = <<~MD
      | header 1 | header 2 |
      | -------- | -------- |
      | cell 1   | cell 2   |
      | cell 3   | cell 4   |
    MD
    expected = <<~HTML
      <table><thead>
      <tr>
      <th>header 1</th>
      <th>header 2</th>
      </tr>
      </thead><tbody>
      <tr>
      <td>cell 1</td>
      <td>cell 2</td>
      </tr>
      <tr>
      <td>cell 3</td>
      <td>cell 4</td>
      </tr>
      </tbody></table>
    HTML
    actual = ActionView::Base.new.render(inline: markdown, type: :md)
    assert_equal expected, actual
  end
end
