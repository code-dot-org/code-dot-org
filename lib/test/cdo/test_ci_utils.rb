require_relative '../test_helper'
require 'cdo/ci_utils'

class CIUtilsTest < Minitest::Test
  def teardown
    CIUtils.__clear_cached_tags_for_test
  end

  def test_knows_when_tag_is_present
    CIUtils.stubs(:git_commit_message).returns('message [foo]')

    assert CIUtils.tagged? 'foo'
    refute CIUtils.tagged? 'bar'
  end

  def test_tags_are_case_insensitive
    CIUtils.stubs(:git_commit_message).returns('message [Foo]')

    assert CIUtils.tagged? 'foo'
    assert CIUtils.tagged? 'Foo'
    assert CIUtils.tagged? 'FOO'
  end

  def test_does_not_see_commit_message_as_a_tag
    CIUtils.stubs(:git_commit_message).returns('message [foo] suffix')

    refute CIUtils.tagged? 'message'
    refute CIUtils.tagged? 'suffix'
  end

  def test_sees_multiple_tags
    CIUtils.stubs(:git_commit_message).returns('message [foo] [bar]')

    assert CIUtils.tagged? 'foo'
    assert CIUtils.tagged? 'bar'
    refute CIUtils.tagged? 'baz'
  end

  def test_multi_word_tags
    CIUtils.stubs(:git_commit_message).returns('message [foo bar]')

    # Detects correct word combination
    assert CIUtils.tagged? 'foo bar'
    refute CIUtils.tagged? 'bar baz'

    # Is whitespace-agnostic
    assert CIUtils.tagged? 'foo   bar'

    # Is word-order agnostic
    assert CIUtils.tagged? 'bar foo'

    # Ignores repeated words (a tag is a Set)
    assert CIUtils.tagged? 'foo foo bar bar bar'
  end
end
