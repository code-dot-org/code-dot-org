require 'test_helper'

class LevelGroupTest < ActiveSupport::TestCase

  # Create a multi with name "levelX" where X is passed in
  def get_multi_dsl(id)
    "
    name 'level#{id}'
    title 'g(y) = y + 2'
    question 'What is the name of this function?'
    content1 'content1'
    right 'g'
    wrong 'y'
    wrong '2'
    "
  end

  def get_evaluation_multi_dsl(id)
    stage1 = create :stage
    stage2 = create :stage

    "
    name 'evaluation_multi_#{id}'
    title 'evaluation multi #{id}'
    question 'Some Question'
    answer 'Answer 1', weight: #{rand(5)}, stage_name: '#{stage1.name}'
    answer 'Answer 2', weight: #{rand(5)}, stage_name: '#{stage2.name}'
    answer 'Answer 3'
    "
  end

  # Create an external with name "externalX" where X is passed in
  def get_external_dsl(id)
    "
    name 'external#{id}'
    title 'an external'
    markdown <<MARKDOWN
    ### Sample external
    This is a first sample of some instruction text that's stored in a .external file.
MARKDOWN
    "
  end

  # Test that level.pages for a level_group has the correct offsets and page numbers.
  test 'get level group pages' do
    # DSL for the level_group.
    level_group_input_dsl = "
  name 'long assessment'
  title 'Long Assessment'
  submittable 'true'

  page
  level 'level1'
  level 'level2'
  level 'level3'
  page
  level 'level4'
  text 'external1'
  level 'level5'
  page
  level 'level6'
  level 'level7'
  "

    # Create multis named level1-level7.
    levels = {}
    (1..7).each do |id|
      levels["multi_#{id}"] = Multi.create_from_level_builder({}, {dsl_text: get_multi_dsl(id)})
    end

    # Create the external level.
    External.create_from_level_builder({}, {dsl_text: get_external_dsl(1)})

    # Create the level_group.
    level_group = LevelGroup.create_from_level_builder({}, {name: 'my_level_group', dsl_text: level_group_input_dsl})

    # Validate the page offsets and page_numbers.
    pages = level_group.pages
    assert_equal 'Long Assessment', level_group.properties['title']
    assert_equal pages[0].offset, 0
    assert_equal pages[0].page_number, 1
    assert_equal pages[1].offset, 3
    assert_equal pages[1].page_number, 2
    assert_equal pages[2].offset, 5
    assert_equal pages[2].page_number, 3

    # Validate the text index.
    texts = level_group.properties["texts"]
    assert_equal texts[0]["index"], 4
  end

  # Test that a level_group can't be created if it has duplicate levels.
  test 'level group fail on duplicate levels' do
    # DSL for the level_group, with a duplicate level.
    level_group_input_dsl = "
  name 'long assessment'
  title 'Long Assessment'
  submittable 'true'

  page
  level 'level1'
  level 'level2'
  level 'level3'
  page
  level 'level3'
  level 'level4'
  level 'level5'
  page
  level 'level6'
  level 'level7'
  "

    # Create multis named level1-level7.
    levels = {}
    (1..7).each do |id|
      levels["multi_#{id}"] = Multi.create_from_level_builder({}, {dsl_text: get_multi_dsl(id)})
    end

    # Assert that level_group can't be created.
    assert_raises RuntimeError do
      LevelGroup.create_from_level_builder({}, {name: 'my_level_group', dsl_text: level_group_input_dsl})
    end
  end

  # Test that a level_group can't be created with an incorrect level type.
  test 'level group fail on wrong level type' do
    # DSL for the level_group, mentioning a contract-match level.
    level_group_input_dsl = "
  name 'long assessment'
  title 'Long Assessment'
  submittable 'true'

  page
  level 'level1'
  level 'level2'
  level 'level3'
  page
  level 'level4'
  level 'level5'
  page
  level 'levelCM'
  level 'level6'
  level 'level7'
  "

    # Create multis named level1-level7.
    levels = {}
    (1..7).each do |id|
      levels["multi_#{id}"] = Multi.create_from_level_builder({}, {dsl_text: get_multi_dsl(id)})
    end

    # DSL for a contract-match level, which is then created.
    contract_match_dsl_text = "
  name 'levelCM'
  title 'Eval Contracts 1 B'
  content1 'Write a contract for the star function'
  content2 'Eval Contracts 1 A.solution_blocks, 300'
  answer 'star|image|color:string|radius:Number|style:string'
  "
    ContractMatch.create_from_level_builder({}, {type: 'ContractMatch', dsl_text: contract_match_dsl_text})

    # Assert that level_group can't be created.
    assert_raises RuntimeError do
      LevelGroup.create_from_level_builder({}, {name: 'my_level_group', dsl_text: level_group_input_dsl})
    end
  end

  test 'is_plc_evaluation?' do
    evaluation_multi_1 = EvaluationMulti.create_from_level_builder({}, {dsl_text: get_evaluation_multi_dsl(1)})
    evaluation_multi_2 = EvaluationMulti.create_from_level_builder({}, {dsl_text: get_evaluation_multi_dsl(2)})
    non_evaluation_multi = Multi.create_from_level_builder({}, {dsl_text: get_multi_dsl(3)})

    evaluation_level_group_dsl = "
    name 'plc assessment'
    title 'plc assessment'
    submittable 'true'

    page
    level '#{evaluation_multi_1.name}'
    level '#{evaluation_multi_2.name}'
    "

    plc_evaluation = LevelGroup.create_from_level_builder({}, {name: 'evaluation_multi', dsl_text: evaluation_level_group_dsl})

    non_evaluation_level_group_dsl = "
    name 'non plc assessment'
    title 'non plc assessment'
    submittable 'true'

    page
    level '#{evaluation_multi_1.name}'
    level '#{non_evaluation_multi.name}'
    "

    non_plc_evaluation = LevelGroup.create_from_level_builder({}, {name: 'non_evaluation_multi', dsl_text: non_evaluation_level_group_dsl})

    assert plc_evaluation.plc_evaluation?
    assert_not non_plc_evaluation.plc_evaluation?
  end

end
