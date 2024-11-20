require_relative '../test_helper'
require 'cdo/ci_utils'

class CITest < Minitest::Test
  def teardown
    CI::Utils.__clear_cached_tags_for_test
  end

  def test_knows_when_tag_is_present
    CI::Utils.stubs(:git_commit_message).returns('message [foo]')

    assert CI::Utils.tagged? 'foo'
    refute CI::Utils.tagged? 'bar'
  end

  def test_tags_are_case_insensitive
    CI::Utils.stubs(:git_commit_message).returns('message [Foo]')

    assert CI::Utils.tagged? 'foo'
    assert CI::Utils.tagged? 'Foo'
    assert CI::Utils.tagged? 'FOO'
  end

  def test_does_not_see_commit_message_as_a_tag
    CI::Utils.stubs(:git_commit_message).returns('message [foo] suffix')

    refute CI::Utils.tagged? 'message'
    refute CI::Utils.tagged? 'suffix'
  end

  def test_sees_multiple_tags
    CI::Utils.stubs(:git_commit_message).returns('message [foo] [bar]')

    assert CI::Utils.tagged? 'foo'
    assert CI::Utils.tagged? 'bar'
    refute CI::Utils.tagged? 'baz'
  end

  def test_multi_word_tags
    CI::Utils.stubs(:git_commit_message).returns('message [foo bar]')

    # Detects correct word combination
    assert CI::Utils.tagged? 'foo bar'
    refute CI::Utils.tagged? 'bar baz'

    # Is whitespace-agnostic
    assert CI::Utils.tagged? 'foo   bar'

    # Is word-order agnostic
    assert CI::Utils.tagged? 'bar foo'

    # Ignores repeated words (a tag is a Set)
    assert CI::Utils.tagged? 'foo foo bar bar bar'
  end
end
