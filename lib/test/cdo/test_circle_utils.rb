require_relative '../test_helper'
require 'cdo/circle_utils'

class CircleUtilsTest < Minitest::Test
  def teardown
    CircleUtils.__clear_cached_tags_for_test
  end

  def test_knows_when_tag_is_present
    CircleUtils.stubs(:circle_commit_message).returns('message [foo]')

    assert CircleUtils.tagged? 'foo'
    refute CircleUtils.tagged? 'bar'
  end

  def test_tags_are_case_insensitive
    CircleUtils.stubs(:circle_commit_message).returns('message [Foo]')

    assert CircleUtils.tagged? 'foo'
    assert CircleUtils.tagged? 'Foo'
    assert CircleUtils.tagged? 'FOO'
  end

  def test_does_not_see_commit_message_as_a_tag
    CircleUtils.stubs(:circle_commit_message).returns('message [foo] suffix')

    refute CircleUtils.tagged? 'message'
    refute CircleUtils.tagged? 'suffix'
  end

  def test_sees_multiple_tags
    CircleUtils.stubs(:circle_commit_message).returns('message [foo] [bar]')

    assert CircleUtils.tagged? 'foo'
    assert CircleUtils.tagged? 'bar'
    refute CircleUtils.tagged? 'baz'
  end

  def test_multi_word_tags
    CircleUtils.stubs(:circle_commit_message).returns('message [foo bar]')

    # Detects correct word combination
    assert CircleUtils.tagged? 'foo bar'
    refute CircleUtils.tagged? 'bar baz'

    # Is whitespace-agnostic
    assert CircleUtils.tagged? 'foo   bar'

    # Is word-order agnostic
    assert CircleUtils.tagged? 'bar foo'

    # Ignores repeated words (a tag is a Set)
    assert CircleUtils.tagged? 'foo foo bar bar bar'
  end
end
