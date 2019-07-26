require 'test_helper'

class BubbleChoiceTest < ActiveSupport::TestCase
  include Rails.application.routes.url_helpers
  self.use_transactional_test_case = true

  setup_all do
    Rails.application.config.stubs(:levelbuilder_mode).returns false
    create :game, name: 'BubbleChoice'

    @sublevel1 = create :level, name: 'choice_1', display_name: 'Choice 1!', thumbnail_url: 'some-fake.url/kittens.png', bubble_choice_description: 'Choose me!'
    @sublevel2 = create :level, name: 'choice_2'
    sublevels = [@sublevel1, @sublevel2]
    @bubble_choice = create :bubble_choice_level, name: 'bubble_choices', display_name: 'Bubble Choices', description: 'Choose one or more!', sublevels: sublevels
    @script_level = create :script_level, levels: [@bubble_choice]
  end

  test 'create_from_level_builder creates level from DSL input' do
    sublevel = create :level, name: 'level for bubble choice'

    input_dsl = <<DSL
name 'bubble choice 1'
display_name 'Choose a Bubble'
description 'Choose the level you want to complete.'

sublevels
level 'level for bubble choice'
DSL

    level = BubbleChoice.create_from_level_builder({}, {name: 'bubble choice 1', dsl_text: input_dsl})
    assert_equal 'bubble choice 1', level.name
    assert_equal 'Choose a Bubble', level.display_name
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

  test 'sublevel_position returns the position of a sublevel in a parent level' do
    assert_equal 1, @bubble_choice.sublevel_position(@sublevel1)
    assert_equal 2, @bubble_choice.sublevel_position(@sublevel2)
  end

  test 'sublevel_position returns nil for a level that is not a sublevel of the parent' do
    assert_nil @bubble_choice.sublevel_position(create(:level))
  end

  test 'summarize' do
    summary = @bubble_choice.summarize
    expected_summary = {
      display_name: @bubble_choice.display_name,
      description: @bubble_choice.description,
      sublevels: @bubble_choice.summarize_sublevels
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
      {
        id: @sublevel1.id,
        display_name: @sublevel1.display_name,
        description: @sublevel1.bubble_choice_description,
        thumbnail_url: @sublevel1.thumbnail_url,
        url: level_url(@sublevel1.id)
      },
      {
        id: @sublevel2.id,
        display_name: @sublevel2.name,
        description: @sublevel2.bubble_choice_description,
        thumbnail_url: nil,
        url: level_url(@sublevel2.id)
      }
    ]

    assert_equal expected_summary, sublevel_summary
  end

  test 'summarize_sublevels with script_level' do
    sublevel_summary = @bubble_choice.summarize_sublevels(script_level: @script_level)
    assert_equal 2, sublevel_summary.length
    refute_nil sublevel_summary.first[:url]
    refute_nil sublevel_summary.last[:url]
  end

  test 'summarize_sublevels with user_id' do
    student = create :student
    create :user_level, user: student, level: @sublevel1, best_result: ActivityConstants::BEST_PASS_RESULT
    sublevel_summary = @bubble_choice.summarize_sublevels(user_id: student.id)
    assert_equal 2, sublevel_summary.length
    assert sublevel_summary.first[:perfect]
    assert_nil sublevel_summary.last[:perfect]
  end

  test 'best_result_sublevel_id returns sublevel with highest best_result for user' do
    student = create :student
    create :user_level, user: student, level: @sublevel2, best_result: 100
    create :user_level, user: student, level: @sublevel1, best_result: 20

    assert_equal @sublevel2, @bubble_choice.best_result_sublevel(student)
  end

  test 'self.parent_levels returns BubbleChoice parent levels for given sublevel name' do
    sublevel1 = create :level, name: 'sublevel_1'
    sublevel2 = create :level, name: 'sublevel_2'
    parent1 = create :bubble_choice_level, name: 'parent_1', sublevels: [sublevel1, sublevel2]
    parent2 = create :bubble_choice_level, name: 'parent_2', sublevels: [sublevel1]

    sublevel1_parents = BubbleChoice.parent_levels(sublevel1.name)
    assert_equal 2, sublevel1_parents.length
    assert sublevel1_parents.include?(parent1)
    assert sublevel1_parents.include?(parent2)

    assert_equal [parent1], BubbleChoice.parent_levels(sublevel2.name)

    # Edge cases
    assert_empty BubbleChoice.parent_levels("sublevel") # contained by sublevel names above
    assert_empty BubbleChoice.parent_levels("sublevel_12") # contains sublevel name above
    assert_empty BubbleChoice.parent_levels("nonexistent level name")
  end
end
