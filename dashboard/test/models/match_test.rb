require 'test_helper'

class MatchLevelTest < ActiveSupport::TestCase
  test 'shuffled answers never exactly match answers' do
    @level = create :match, properties: {
      answers: [{text: "one"}, {text: "two"}, {text: "three"}]
    }

    # shuffle the answers ten times. This doesn't _guarantee_ we'll get all
    # possible shuffles on any given test run, but over all test runs for all
    # time we should be pretty well set.
    possible_shuffles = Array.new(10).map do |_|
      @level.shuffled_indexed_answers
    end

    # strip indexes from the shuffled and indexed answers so we can easily test
    # just the shuffled-ness
    possible_shuffles.each do |shuffle|
      shuffle.each {|answer| answer.delete("index")}
    end

    possible_shuffles.each do |shuffle|
      refute_equal shuffle, @level.answers
    end
  end
end
