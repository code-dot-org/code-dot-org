require_relative '../test_helper'
require 'cdo/ci_utils'

class CITest < Minitest::Test
  def teardown
    CI.__clear_cached_tags_for_test
  end

  def test_knows_when_tag_is_present
    CI.stubs(:git_commit_message).returns('message [foo]')

    assert CI.tagged? 'foo'
    refute CI.tagged? 'bar'
  end

  def test_tags_are_case_insensitive
    CI.stubs(:git_commit_message).returns('message [Foo]')

    assert CI.tagged? 'foo'
    assert CI.tagged? 'Foo'
    assert CI.tagged? 'FOO'
  end

  def test_does_not_see_commit_message_as_a_tag
    CI.stubs(:git_commit_message).returns('message [foo] suffix')

    refute CI.tagged? 'message'
    refute CI.tagged? 'suffix'
  end

  def test_sees_multiple_tags
    CI.stubs(:git_commit_message).returns('message [foo] [bar]')

    assert CI.tagged? 'foo'
    assert CI.tagged? 'bar'
    refute CI.tagged? 'baz'
  end

  def test_multi_word_tags
    CI.stubs(:git_commit_message).returns('message [foo bar]')

    # Detects correct word combination
    assert CI.tagged? 'foo bar'
    refute CI.tagged? 'bar baz'

    # Is whitespace-agnostic
    assert CI.tagged? 'foo   bar'

    # Is word-order agnostic
    assert CI.tagged? 'bar foo'

    # Ignores repeated words (a tag is a Set)
    assert CI.tagged? 'foo foo bar bar bar'
  end
end
