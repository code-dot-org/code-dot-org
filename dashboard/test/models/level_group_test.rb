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

    # Create the level_group.
    level_group = LevelGroup.create_from_level_builder({}, {name: 'my_level_group', dsl_text: level_group_input_dsl})
    pages = level_group.pages

    # Validate the page offsets and page_numbers.
    assert_equal 'Long Assessment', level_group.properties['title']
    assert_equal pages[0].offset, 0
    assert_equal pages[0].page_number, 1
    assert_equal pages[1].offset, 3
    assert_equal pages[1].page_number, 2
    assert_equal pages[2].offset, 5
    assert_equal pages[2].page_number, 3
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

end
