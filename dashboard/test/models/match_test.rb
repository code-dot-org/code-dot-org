require 'test_helper'

class MatchLevelTest < ActiveSupport::TestCase
  test 'shuffled answers never exactly match answers' do
    level = create :match, properties: {
      answers: [{text: "one"}, {text: "two"}, {text: "three"}]
    }

    # shuffle the answers ten times. This doesn't _guarantee_ we'll get all
    # possible shuffles on any given test run, but over all test runs for all
    # time we should be pretty well set.
    possible_shuffles = Array.new(10).map do |_|
      level.shuffled_indexed_answers
    end

    # strip indexes from the shuffled and indexed answers so we can easily test
    # just the shuffled-ness
    possible_shuffles.each do |shuffle|
      shuffle.each {|answer| answer.delete("index")}
    end

    possible_shuffles.each do |shuffle|
      refute_equal shuffle, level.answers
    end
  end

  test 'can localize text-based answers' do
    level = create :match, name: "test match localization", properties: {
      answers: [{text: "one"}, {text: "two"}, {text: "three"}]
    }

    test_locale = :"te-ST"
    I18n.locale = test_locale
    custom_i18n = {
      "data" => {
        "match" => {
          "test match localization" => {
            "one" => "un",
            "two" => "deux",
          }
        }
      }
    }
    I18n.backend.store_translations test_locale, custom_i18n

    assert_equal "un", level.localize_text("one")
    assert_equal "deux", level.localize_text("two")

    # Missing translation data should work, too
    assert_equal "three", level.localize_text("three")
  end

  test 'localization does not break non-text-based answers' do
    test_locale = :"te-ST"
    I18n.locale = test_locale

    create :level,
      name: "Blocks Match Example",
      solution_blocks: "<xml><block type='wooo, test block' /></xml>"

    image_match = "example.png"
    block_match = "Blocks Match Example.solution_blocks, 200"
    level_match = "Ninjacat Demo Embed.level"
    level = create :match, name: "test match localization", properties: {
      answers: [
        {text: image_match},
        {text: block_match},
        {text: level_match}
      ]
    }

    assert_equal "<img src='example.png' ></img>", level.localize_text(image_match)
    assert_equal "", level.localize_text(block_match)
    #assert_equal "", level.localize_text(level_match)
  end
end
