require 'test_helper'

class Services::MarkdownPreprocessorTest < ActiveSupport::TestCase
  setup do
    create :resource, key: 'first-resource', name: "First Resource", url: "example.com/first"
    create :resource, key: 'second-resource', name: "Second Resource", url: "example.com/second"
  end

  test 'regular method returns and does not modifiy' do
    input = "[r first-resource]"
    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal "[r first-resource]", input
    assert_equal "[First Resource](example.com/first)", result
  end

  test 'bang method modifies and returns' do
    input = "[r first-resource]"
    result = Services::MarkdownPreprocessor.sub_resource_links!(input)
    assert_equal "[First Resource](example.com/first)", input
    assert_equal "[First Resource](example.com/first)", result
  end

  test 'can substitute a basic resource link' do
    input = "this string has a resource [r first-resource] link. And a [regular](link)"
    expected = "this string has a resource [First Resource](example.com/first) link. And a [regular](link)"

    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal expected, result
  end

  test 'can handle multiple resource links in a single string' do
    input = "this string has [r second-resource] two resource [r first-resource] links"
    expected = "this string has [Second Resource](example.com/second) two resource [First Resource](example.com/first) links"

    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal expected, result
  end

  test 'can handle complex markdown strings' do
    input = <<~MARKDOWN
      This is some more complex markdown content.

      It has:

      1. A list with [r first-resource] a link
      2. A **formatted [r second-resource] link**

      We also demonstrate that the markdown preprocessor we have doesn't
      respect markdown, and will replace stuff that actual markdown would leave
      untouched.

      ```
      like code blocks
      [r first-resource]
      ```
    MARKDOWN
    expected = <<~MARKDOWN
      This is some more complex markdown content.

      It has:

      1. A list with [First Resource](example.com/first) a link
      2. A **formatted [Second Resource](example.com/second) link**

      We also demonstrate that the markdown preprocessor we have doesn't
      respect markdown, and will replace stuff that actual markdown would leave
      untouched.

      ```
      like code blocks
      [First Resource](example.com/first)
      ```
    MARKDOWN

    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal expected, result
  end

  test 'ignores unmatched resource keys' do
    input = "this string has a resource [r nonexistent-resource] link. And a [regular](link)"
    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal input, result
  end
end
