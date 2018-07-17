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

  test "get_sublevel_last_attempt" do
    script = create :script
    level1 = create :multi
    level2 = create :multi
    properties = {pages: [{levels: [level1.name]}, {levels: [level2.name]}]}
    create :level_group, name: 'level_group', properties: properties

    teacher = create :teacher
    student = create :student

    student_level_source = create :level_source, data: '1'
    teacher_level_source = create :level_source, data: '2'

    create :user_level, user: student, level: level1, script: script, level_source: student_level_source
    create :user_level, user: teacher, level: level1, script: script, level_source: teacher_level_source

    # loads student's attempt when current_user and user are provided
    assert_equal '1', LevelGroup.get_sublevel_last_attempt(teacher, student, level1, script)
    # loads user's attempt if user provided
    assert_equal '2', LevelGroup.get_sublevel_last_attempt(teacher, nil, level1, script)
    # does not load attempt for a different script
    assert_nil LevelGroup.get_sublevel_last_attempt(teacher, nil, level1, create(:script))
    # returns undefined when signed out
    assert_nil LevelGroup.get_sublevel_last_attempt(nil, nil, level1, script)
  end

  # Test that clone_with_suffix performs a deep copy of a LevelGroup, and the
  # copy has the correct dsl text.
  test 'clone level group with suffix' do
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

    level_group_copy_dsl = "name 'long assessment_copy'
title 'Long Assessment'
submittable 'true'

page
level 'level1_copy'
level 'level2_copy'
level 'level3_copy'

page
level 'level4_copy'
text 'external1_copy'
level 'level5_copy'

page
level 'level6_copy'
level 'level7_copy'"

    # Create multis named level1-level7.
    levels = {}
    (1..7).each do |id|
      levels["multi_#{id}"] = Multi.create_from_level_builder({}, {dsl_text: get_multi_dsl(id)})
    end

    # Create the external level.
    External.create_from_level_builder({}, {dsl_text: get_external_dsl(1)})

    # Create the level_group.
    level_group = LevelGroup.create_from_level_builder({}, {name: 'my_level_group', dsl_text: level_group_input_dsl})

    # Copy the level group and all its sub levels.
    level_group_copy = level_group.clone_with_suffix('_copy')

    assert_equal level_group_copy_dsl, level_group_copy.dsl_text
    (1..7).each do |id|
      refute_nil l = Level.find_by_name("level#{id}_copy")
      assert_equal 'What is the name of this function?', l.properties['questions'].first['text']
    end
    refute_nil l = Level.find_by_name('external1_copy')
    assert_includes l.properties['markdown'], 'Sample external'

    # clean up
    File.delete(level_group_copy.filename)
  end

  test 'get_summarized_survey_results returns a hash of results' do
    # Seed the RNG deterministically so we get the same "random" shuffling of results.
    srand 1

    # Create script with an anonymous assessment.
    script = create :script
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['anonymous'] = 'true'
    level1.properties['pages'] = [
      {
        levels: %w(
          level_free_response
          level_multi_unsubmitted
          level_multi_correct
          level_multi_incorrect
          level_multi_unattempted
        )
      }
    ]
    level1.save!
    script_level = create :script_level, script: script, levels: [level1], assessment: true

    updated_at = Time.now

    # Create a section with students
    teacher = create(:teacher)
    section = create(:section, user: teacher, login_type: 'word')

    # Set of students in section.
    students = []
    5.times do |i|
      student = create(:student, name: "student_#{i}")
      students << student
      create(:follower, section: section, student_user: student)
    end

    # All students did the LevelGroup, and the free response part of the survey.
    students.each_with_index do |student, student_index|
      create :user_level, user: student, script: script, level: level1,
        level_source: create(:level_source, level: level1), best_result: 100,
        submitted: true, updated_at: updated_at

      create :user_level, user: student, script: script, level: sub_level1,
        level_source: create(:level_source, level: sub_level1, data: "Free response from student #{student_index + 3}")
      create :user_level, user: student, script: script, level: sub_level2,
        level_source: create(:level_source, level: sub_level2, data: "-1")
      create :user_level, user: student, script: script, level: sub_level3,
        level_source: create(:level_source, level: sub_level3, data: "-1")
      create :user_level, user: student, script: script, level: sub_level4,
        level_source: create(:level_source, level: sub_level4, data: "-1")
    end

    actual_survey_results = LevelGroup.get_summarized_survey_results(script, section)

    expected_results = {
      level1.id => {
        stage_name: script_level.stage.localized_title,
        levelgroup_results: [
          {
            type: "text_match",
            question: "test",
            results: [
              {result: "Free response from student 5"},
              {result: "Free response from student 6"},
              {result: "Free response from student 4"},
              {result: "Free response from student 7"},
              {result: "Free response from student 3"}
            ],
            answer_texts: nil,
            question_index: 0,
          },
          {
            type: "multi",
            question: "question text",
            results: [{}, {}, {}, {}, {}],
            answer_texts: ["answer1", "answer2", "answer3", "answer4"],
            question_index: 1,
          },
          {
            type: "multi",
            question: "question text",
            results: [{}, {}, {}, {}, {}],
            answer_texts: ["answer1", "answer2", "answer3", "answer4"],
            question_index: 2,
          },
          {
            type: "multi",
            question: "question text",
            results: [{}, {}, {}, {}, {}],
            answer_texts: ["answer1", "answer2", "answer3", "answer4"],
            question_index: 3,
          },
          {
            type: "multi",
            question: "question text",
            results: [{}, {}, {}, {}, {}],
            answer_texts: ["answer1", "answer2", "answer3", "answer4"],
            question_index: 4,
          }
        ]
      }
    }

    assert_equal expected_results.keys, actual_survey_results.keys
    assert_equal expected_results[level1.id][:stage_name],
      actual_survey_results[level1.id][:stage_name]
    assert_equal expected_results[level1.id][:levelgroup_results],
      actual_survey_results[level1.id][:levelgroup_results]
  end

  test 'get_summarized_survey_results returns no results when less than 5 responses' do
    # Create script with an anonymous assessment.
    script = create :script
    create :text_match, name: 'level_free_response', type: 'TextMatch'
    create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['anonymous'] = 'true'
    level1.properties['pages'] = [
      {
        levels: %w(
          level_free_response
          level_multi_unsubmitted
          level_multi_unattempted
        )
      }
    ]
    level1.save!
    script_level = create :script_level, script: script, levels: [level1], assessment: true

    # Create a section
    teacher = create(:teacher)
    section = create(:section, user: teacher, login_type: 'word')

    actual_survey_results = LevelGroup.get_summarized_survey_results(script, section)

    expected_results = {
      level1.id => {
        stage_name: script_level.stage.localized_title,
        levelgroup_results: []
      }
    }

    assert_equal expected_results.keys, actual_survey_results.keys
    assert_equal expected_results[level1.id][:stage_name],
      actual_survey_results[level1.id][:stage_name]
    assert_equal [], actual_survey_results[level1.id][:levelgroup_results]
  end
end
