require_relative '../test_helper'
require 'cdo/circle_utils'

class CircleUtilsTest < Minitest::Test
  def teardown
    CircleUtils.__clear_cached_tags_for_test
  end

  def test_knows_when_tag_is_present
    CircleUtils.stub :circle_commit_message, 'message [foo]' do
      assert CircleUtils.tagged? 'foo'
      refute CircleUtils.tagged? 'bar'
    end
  end

  def test_tags_are_case_insensitive
    CircleUtils.stub :circle_commit_message, 'message [Foo]' do
      assert CircleUtils.tagged? 'foo'
      assert CircleUtils.tagged? 'Foo'
      assert CircleUtils.tagged? 'FOO'
    end
  end

  def test_does_not_see_commit_message_as_a_tag
    CircleUtils.stub :circle_commit_message, 'message [foo] suffix' do
      refute CircleUtils.tagged? 'message'
      refute CircleUtils.tagged? 'suffix'
    end
  end

  def test_sees_multiple_tags
    CircleUtils.stub :circle_commit_message, 'message [foo] [bar]' do
      assert CircleUtils.tagged? 'foo'
      assert CircleUtils.tagged? 'bar'
      refute CircleUtils.tagged? 'baz'
    end
  end

  def test_multi_word_tags
    CircleUtils.stub :circle_commit_message, 'message [foo bar]' do
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
end
