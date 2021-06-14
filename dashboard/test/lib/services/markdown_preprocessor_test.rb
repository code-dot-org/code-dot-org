require 'test_helper'

class Services::MarkdownPreprocessorTest < ActiveSupport::TestCase
  setup do
    course_offering = create :course_offering, key: 'test-course'
    course_version = create :course_version,
      course_offering: course_offering,
      key: '1999'

    create :resource,
      key: 'first-resource',
      name: "First Resource",
      url: "example.com/first",
      course_version: course_version
    create :resource,
      key: 'second-resource',
      name: "Second Resource",
      url: "example.com/second",
      course_version: course_version

    create :vocabulary,
      key: 'first_vocab',
      word: "First Vocabulary",
      definition: "The first of the vocabulary entries.",
      course_version: course_version
    create :vocabulary,
      key: 'second_vocab',
      word: "Second Vocabulary",
      definition: "The second of the vocabulary entries.",
      course_version: course_version
  end

  test 'process method invokes both resource and vocab substitutions' do
    input = "A string containing both a Resource link [r first-resource/test-course/1999] and a Vocab link [v first_vocab/test-course/1999]"
    result = Services::MarkdownPreprocessor.process(input)
    expected = "A string containing both a Resource link [First Resource](example.com/first) and a Vocab link <span class=\"vocab\" title=\"The first of the vocabulary entries.\">First Vocabulary</span>"
    assert_equal expected, result
  end

  test 'process is cached' do
    Rails.cache.clear
    input = "[r first-resource/test-course/1999]"

    # First invocation queries the database
    assert_queries 2 do
      Services::MarkdownPreprocessor.process(input)
    end

    # Future invocations do not
    assert_queries 0 do
      Services::MarkdownPreprocessor.process(input)
    end

    # Each content string is cached individually
    assert_queries 2 do
      Services::MarkdownPreprocessor.process("[r second-resource/test-course/1999]")
    end

    # Clearing the cache causes us to start querying again
    Rails.cache.clear
    assert_queries 2 do
      Services::MarkdownPreprocessor.process(input)
    end
  end

  test 'process caching can be modified with options' do
    input = "[r first-resource/test-course/1999][v first_vocab/test-course/1999]"

    # populate the cache
    Services::MarkdownPreprocessor.process(input)

    # verify that we use the cache by default
    assert_queries 0 do
      Services::MarkdownPreprocessor.process(input)
    end

    # verify that the cache can be skipped
    assert_queries 3 do
      Services::MarkdownPreprocessor.process(input, cache_options: {force: true})
    end
  end

  test 'regular method process returns and does not modify' do
    input = "[r first-resource/test-course/1999]"
    result = Services::MarkdownPreprocessor.process(input)
    assert_equal "[r first-resource/test-course/1999]", input
    assert_equal "[First Resource](example.com/first)", result
  end

  test 'bang method process! modifies and returns' do
    input = "[v first_vocab/test-course/1999]"
    expected = "<span class=\"vocab\" title=\"The first of the vocabulary entries.\">First Vocabulary</span>"

    result = Services::MarkdownPreprocessor.process!(input)
    assert_equal expected, input
    assert_equal expected, result
  end

  test 'sub_resource_links can substitute a basic resource link' do
    input = "this string has a resource [r first-resource/test-course/1999] link. And a [regular](link)"
    expected = "this string has a resource [First Resource](example.com/first) link. And a [regular](link)"

    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal expected, result
  end

  test 'sub_resource_links can handle multiple resource links in a single string' do
    input = "this string has [r second-resource/test-course/1999] two resource [r first-resource/test-course/1999] links"
    expected = "this string has [Second Resource](example.com/second) two resource [First Resource](example.com/first) links"

    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal expected, result
  end

  test 'sub_resource_links can handle complex markdown strings' do
    input = <<~MARKDOWN
      This is some more complex markdown content.

      It has:

      1. A list with [r first-resource/test-course/1999] a link
      2. A **formatted [r second-resource/test-course/1999] link**

      We also demonstrate that the markdown preprocessor we have doesn't
      respect markdown, and will replace stuff that actual markdown would leave
      untouched.

      ```
      like code blocks
      [r first-resource/test-course/1999]
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

  test 'sub_resource_links ignores unmatched resource keys' do
    input = "this string has a resource [r nonexistent-resource/test-course/1999] link. And a [regular](link)"
    result = Services::MarkdownPreprocessor.sub_resource_links(input)
    assert_equal input, result
  end

  test 'sub_vocab_definitions can substitute a basic vocab definition' do
    input = "this string has a vocab [v first_vocab/test-course/1999] definition."
    expected = "this string has a vocab <span class=\"vocab\" title=\"The first of the vocabulary entries.\">First Vocabulary</span> definition."

    result = Services::MarkdownPreprocessor.sub_vocab_definitions(input)
    assert_equal expected, result
  end

  test 'sub_vocab_definitions can handle multiple vocab definitions in a single string' do
    input = "this string has [v second_vocab/test-course/1999] two vocab [v first_vocab/test-course/1999] definitions"
    expected = "this string has <span class=\"vocab\" title=\"The second of the vocabulary entries.\">Second Vocabulary</span> two vocab <span class=\"vocab\" title=\"The first of the vocabulary entries.\">First Vocabulary</span> definitions"

    result = Services::MarkdownPreprocessor.sub_vocab_definitions(input)
    assert_equal expected, result
  end

  test 'sub_vocab_definitions can handle complex markdown strings' do
    input = <<~MARKDOWN
      This is some more complex markdown content.

      It has:

      1. A list with [v first_vocab/test-course/1999] a definition
      2. A **formatted [v second_vocab/test-course/1999] definition**

      We also demonstrate that the markdown preprocessor we have doesn't
      respect markdown, and will replace stuff that actual markdown would leave
      untouched.

      ```
      like code blocks
      [v first_vocab/test-course/1999]
      ```
    MARKDOWN
    expected = <<~MARKDOWN
      This is some more complex markdown content.

      It has:

      1. A list with <span class=\"vocab\" title=\"The first of the vocabulary entries.\">First Vocabulary</span> a definition
      2. A **formatted <span class=\"vocab\" title=\"The second of the vocabulary entries.\">Second Vocabulary</span> definition**

      We also demonstrate that the markdown preprocessor we have doesn't
      respect markdown, and will replace stuff that actual markdown would leave
      untouched.

      ```
      like code blocks
      <span class=\"vocab\" title=\"The first of the vocabulary entries.\">First Vocabulary</span>
      ```
    MARKDOWN

    result = Services::MarkdownPreprocessor.sub_vocab_definitions(input)
    assert_equal expected, result
  end

  test 'sub_vocab_definitions ignores unmatched vocab keys' do
    input = "this string has a vocab [v nonexistent_vocab/test-course/1999] definition."
    result = Services::MarkdownPreprocessor.sub_vocab_definitions(input)
    assert_equal input, result
  end
end
