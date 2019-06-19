require 'test_helper'

class BubbleChoiceTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true

  setup_all do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    create :game, name: 'BubbleChoice'

    @sublevel1 = create :level, name: 'choice_1', display_name: 'Choice 1!', thumbnail_url: 'some-fake.url/kittens.png'
    @sublevel2 = create :level, name: 'choice_2'
    sublevels = [@sublevel1, @sublevel2]
    @bubble_choice = create :bubble_choice_level, name: 'bubble_choices', title: 'Bubble Choices', description: 'Choose one or more!', sublevels: sublevels
    @script_level = create :script_level, levels: [@bubble_choice]
  end

  test 'create_from_level_builder creates level from DSL input' do
    sublevel = create :level, name: 'level for bubble choice'

    input_dsl = <<DSL
name 'bubble choice 1'
title 'Choose a Bubble'
description 'Choose the level you want to complete.'

sublevels
level 'level for bubble choice'
DSL

    level = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice 1', dsl_text: input_dsl})
    assert_equal 'bubble choice 1', level.name
    assert_equal 'Choose a Bubble', level.title
    assert_equal 'Choose the level you want to complete.', level.description
    assert_equal [sublevel], level.sublevels
  end

  test 'create_from_level_builder fails if a sublevel does not exist' do
    input_dsl = <<DSL
name 'bubble choice'

sublevels
level 'some nonexistent level'
DSL

    error = assert_raises do
      BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    end
    assert_equal "Unable to locate level 'some nonexistent level'.", error.message
  end

  test 'create_from_level_builder fails if a sublevel is used twice' do
    create :level, name: 'level for bubble choice'

    input_dsl = <<DSL
name 'bubble choice'

sublevels
level 'level for bubble choice'
level 'level for bubble choice'
DSL

    error = assert_raises do
      BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    end
    assert_equal "Don't use the same level twice in a BubbleChoice (level for bubble choice).", error.message
  end

  test 'sublevels are returned in the order defined by the DSL' do
    sublevel1 = create :level, name: 'bubble choice level 1'
    sublevel2 = create :level, name: 'bubble choice level 2'
    sublevel3 = create :level, name: 'bubble choice level 3'

    input_dsl = <<DSL
name 'bubble choice'

sublevels
level 'bubble choice level 1'
level 'bubble choice level 2'
level 'bubble choice level 3'
DSL

    level = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice', dsl_text: input_dsl})
    assert_equal [sublevel1, sublevel2, sublevel3], level.sublevels
  end

  test 'summarize' do
    summary = @bubble_choice.summarize
    expected_summary = {
      title: @bubble_choice.title,
      description: @bubble_choice.description,
      sublevels: [
        {id: @sublevel1.id, title: @sublevel1.display_name, thumbnail_url: @sublevel1.thumbnail_url},
        {id: @sublevel2.id, title: @sublevel2.name, thumbnail_url: nil}
      ]
    }

    assert_equal expected_summary, summary
  end

  test 'summarize with script_level' do
    summary = @bubble_choice.summarize(script_level: @script_level)

    assert_nil summary[:previous_level_url]
    assert_nil summary[:next_level_url]
    refute_nil summary[:script_url]

    @script_level.stubs(:previous_level).returns(create(:script_level))
    @script_level.stubs(:next_level).returns(create(:script_level))
    summary = @bubble_choice.summarize(script_level: @script_level)

    refute_nil summary[:previous_level_url]
    refute_nil summary[:next_level_url]
    refute_nil summary[:script_url]
  end

  test 'summarize_sublevels' do
    sublevel_summary = @bubble_choice.summarize_sublevels
    expected_summary = [
      {id: @sublevel1.id, title: @sublevel1.display_name, thumbnail_url: @sublevel1.thumbnail_url},
      {id: @sublevel2.id, title: @sublevel2.name, thumbnail_url: nil}
    ]

    assert_equal expected_summary, sublevel_summary
  end

  test 'summarize_sublevels with script_level' do
    sublevel_summary = @bubble_choice.summarize_sublevels(script_level: @script_level)
    assert_equal 2, sublevel_summary.length
    refute_nil sublevel_summary.first[:url]
    refute_nil sublevel_summary.last[:url]
  end

  test 'best_result_sublevel_id returns sublevel with highest best_result for user' do
    student = create :student
    create :user_level, user: student, level: @sublevel2, best_result: 100
    create :user_level, user: student, level: @sublevel1, best_result: 20

    assert_equal @sublevel2, @bubble_choice.best_result_sublevel(student)
  end
end
