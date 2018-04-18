require 'test_helper'

class ApiControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)

    # make them an authorized_Teacher
    cohort = create(:cohort)
    cohort.teachers << @teacher
    cohort.save!

    @teacher_other = create(:teacher)

    @section = create(:section, user: @teacher, login_type: 'word')

    # some of our tests depend on sorting of students by name, thus we name them ourselves
    @students = []
    5.times do |i|
      student = create(:student, name: "student_#{i}")
      @students << student
      create(:follower, section: @section, student_user: student)
    end
    @student_1, @student_2, @student_3, @student_4, @student_5 = @students

    flappy = Script.get_from_cache(Script::FLAPPY_NAME)
    @flappy_section = create(:section, user: @teacher, script_id: flappy.id)
    @student_flappy_1 = create(:follower, section: @flappy_section).student_user
    @student_flappy_1.reload

    allthings = Script.get_from_cache('allthethings')
    @allthings_section = create(:section, user: @teacher, script_id: allthings.id)
    @student_allthings = create(:student, name: 'student_allthings')
    create(:follower, section: @allthings_section, student_user: @student_allthings)
    @allthings_section.reload
    @student_allthings.reload
  end

  setup do
    sign_in @teacher
  end

  private def create_script_with_lockable_stage
    script = create :script

    # Create a LevelGroup level.
    level = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level.properties['title'] =  'Long assessment 1'
    level.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}]
    level.properties['submittable'] = true
    level.save!

    stage = create :stage, name: 'Stage1', script: script, lockable: true

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, stage: stage

    [script, level, stage]
  end

  private def make_text_progress_in_script(script, student)
    level = script.script_levels.map(&:oldest_active_level).find {|l| l.is_a? TextMatch}
    level_source = create :level_source
    create :user_level, level: level, user: student, script: script, level_source: level_source
    # UserLevel.create!(level_id: level.id, user_id: student.id, script_id: script.id, level_source: level_source)
  end

  test "should get text_responses for section with default script" do
    get :section_text_responses, params: {section_id: @section.id}
    assert_response :success

    # we fall back to twenty_hour_script, which has no text_response levels
    assert_equal '[]', @response.body
  end

  test "should get text_responses for section with section script" do
    make_text_progress_in_script(@allthings_section.script, @student_allthings)

    get :section_text_responses, params: {section_id: @allthings_section.id}
    assert_response :success

    response = JSON.parse(@response.body)

    # make sure our response has stage from allthethingsscript
    assert /\/s\/allthethings\// =~ response[0]['url']
  end

  test "should get text_responses for section with assigned course" do
    course = create :course
    create :course_script, course: course, script: Script.get_from_cache('allthethings'), position: 1
    create :course_script, course: course, script: Script.get_from_cache(Script::FLAPPY_NAME), position: 2
    course.reload

    section = create(:section, user: @teacher, login_type: 'word', course: course)
    student = create(:student, name: 'student_in_course')
    create(:follower, section: section, student_user: student)
    section.reload
    student.reload

    make_text_progress_in_script(Script.get_from_cache('allthethings'), student)

    get :section_text_responses, params: {section_id: section.id}
    assert_response :success

    response = JSON.parse(@response.body)

    # make sure our response has stage from allthethings
    assert /\/s\/allthethings\// =~ response[0]['url']
  end

  test "should get text_responses for section with specific script" do
    script = Script.find_by_name('cspunit1')

    make_text_progress_in_script(@allthings_section.script, @student_allthings)
    make_text_progress_in_script(script, @student_allthings)

    get :section_text_responses, params: {
      section_id: @allthings_section.id,
      script_id: script.id
    }
    assert_response :success

    response = JSON.parse(@response.body)
    # did not receive responses from multiple scripts
    assert_equal 1, response.length
    # response is from script_id (not section's script)
    assert /\/s\/cspunit1\// =~ response[0]['url']
  end

  test "should get text_responses for section with script with text response" do
    script = create :script, name: 'text-response-script'
    stage1 = create :stage, script: script, name: 'First Stage'
    stage2 = create :stage, script: script, name: 'Second Stage'

    # create 2 text_match levels
    level1 = create :text_match
    level1.properties['title'] = 'Text Match 1'
    level1.save!
    create :script_level, script: script, levels: [level1], stage: stage1

    level2 = create :text_match
    level2.properties['title'] = 'Text Match 2'
    level2.save!
    create :script_level, script: script, levels: [level2], stage: stage2
    # create some other random levels
    5.times do
      create :script_level, script: script
    end

    # student_1 has two answers
    level_source1a = create :level_source, level: level1,
      data: 'Here is the answer 1a'
    level_source1b = create :level_source, level: level2,
      data: 'Here is the answer 1b'
    create :activity, user: @student_1, level: level1, level_source: level_source1a
    create :activity, user: @student_1, level: level2, level_source: level_source1b
    create :user_level, user: @student_1, level: level1, script: script,
      attempts: 1, level_source: level_source1a
    create :user_level, user: @student_1, level: level2, script: script,
      attempts: 1, level_source: level_source1b

    # student_2 has one answer
    level_source2 = create :level_source, level: level2, data: 'Here is the answer 2'
    create :activity, user: @student_2, level: level1, level_source: level_source2
    create :user_level, user: @student_2, level: level1, script: script,
      attempts: 1, level_source: level_source2

    get :section_text_responses, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success

    expected_response = [
      {
        'student' => {'id' => @student_1.id, 'name' => @student_1.name},
        'stage' => 'Lesson 1: First Stage',
        'puzzle' => 1,
        'question' => 'Text Match 1',
        'response' => 'Here is the answer 1a',
        'url' => "http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}&user_id=#{@student_1.id}"
      },
      {
        'student' => {'id' => @student_1.id, 'name' => @student_1.name},
        'stage' => 'Lesson 2: Second Stage',
        'puzzle' => 1,
        'question' => 'Text Match 2',
        'response' => 'Here is the answer 1b',
        'url' => "http://test.host/s/#{script.name}/stage/2/puzzle/1?section_id=#{@section.id}&user_id=#{@student_1.id}"
      },
      {
        'student' => {'id' => @student_2.id, 'name' => @student_2.name},
        'stage' => 'Lesson 1: First Stage',
        'puzzle' => 1,
        'question' => 'Text Match 1',
        'response' => 'Here is the answer 2',
        'url' => "http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}&user_id=#{@student_2.id}"
      }
    ]
    assert_equal expected_response, JSON.parse(@response.body)
  end

  test "should get assessments for section with script with level_group assessment" do
    script = create :script

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    # create 2 level_group levels
    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # student_1 has an assessment
    level_source = create(
      :level_source,
      level: level1,
      data: %Q({"#{sub_level1.id}":{"result":"This is a free response"},"#{sub_level2.id}":{"result":"0"},"#{sub_level3.id}":{"result":"1"},"#{sub_level4.id}":{"result":"-1"}})
    )
    create :activity, user: @student_1, level: level1,
      level_source: level_source

    updated_at = Time.now

    create :user_level, user: @student_1, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at, level_source: level_source

    get :section_assessments, params: {
      section_id: @section.id,
      script_id: script.id
    }

    assert_response :success
    # all these are translation missing because we don't actually generate i18n files in tests
    expected_response = [
      {
        "student" => {"id" => @student_1.id, "name" => @student_1.name},
        "stage" => "translation missing: en-US.data.script.name.#{script.name}.title",
        "puzzle" => 1,
        "question" => "Long assessment 1",
        "url" => "http://test.host/s/#{script.name}/stage/1/puzzle/1?section_id=#{@section.id}&user_id=#{@student_1.id}",
        "multi_correct" => 1,
        "multi_count" => 4,
        "submitted" => true,
        "timestamp" => updated_at.utc.to_s,
        "level_results" => [
          {"student_result" => "This is a free response", "correct" => "free_response"},
          {"student_result" => "A", "correct" => "correct"},
          {"student_result" => "B", "correct" => "incorrect"},
          {"student_result" => "", "correct" => "unsubmitted"},
          {"correct" => "unsubmitted"}
        ]
      }
    ]
    assert_equal expected_response, JSON.parse(@response.body)
  end

  test "should get surveys for section with script with anonymous level_group assessment" do
    # Seed the RNG deterministically so we get the same "random" shuffling of results.
    srand 1

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
      {levels: ['level_free_response', 'level_multi_unsubmitted']},
      {levels: ['level_multi_correct', 'level_multi_incorrect']},
      {levels: ['level_multi_unattempted']}
    ]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    updated_at = Time.now

    # All students did the LevelGroup.
    @students.each do |student|
      create :user_level, user: student, script: script, level: level1,
        level_source: create(:level_source, level: level1), best_result: 100,
        submitted: true, updated_at: updated_at
    end

    # student_1 did the survey.
    create :user_level, user: @student_1, script: script, level: sub_level1,
      level_source: create(:level_source, level: sub_level1, data: "This is a free response")
    create :user_level, user: @student_1, script: script, level: sub_level2,
      level_source: create(:level_source, level: sub_level2, data: "0")
    create :user_level, user: @student_1, script: script, level: sub_level3,
      level_source: create(:level_source, level: sub_level3, data: "1")
    create :user_level, user: @student_1, script: script, level: sub_level4,
      level_source: create(:level_source, level: sub_level4, data: "-1")

    # student_2 did the survey.
    create :user_level, user: @student_2, script: script, level: sub_level1,
      level_source: create(:level_source, level: sub_level1, data: "This is a different free response")
    create :user_level, user: @student_2, script: script, level: sub_level2,
      level_source: create(:level_source, level: sub_level2, data: "-1")
    create :user_level, user: @student_2, script: script, level: sub_level3,
      level_source: create(:level_source, level: sub_level3, data: "2")
    create :user_level, user: @student_2, script: script, level: sub_level4,
      level_source: create(:level_source, level: sub_level4, data: "3")

    # student_3, student_4, and student_5 did only the free response part of the
    # survey....
    [@student_3, @student_4, @student_5].each_with_index do |student, student_index|
      create :user_level, user: student, script: script, level: sub_level1,
        level_source: create(:level_source, level: sub_level1, data: "Free response from student #{student_index + 3}")
      create :user_level, user: student, script: script, level: sub_level2,
        level_source: create(:level_source, level: sub_level2, data: "-1")
      create :user_level, user: student, script: script, level: sub_level3,
        level_source: create(:level_source, level: sub_level3, data: "-1")
      create :user_level, user: student, script: script, level: sub_level4,
        level_source: create(:level_source, level: sub_level4, data: "-1")
    end

    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success

    # all these are translation missing because we don't actually generate i18n files in tests
    expected_response = [
      {
        "stage" => "translation missing: en-US.data.script.name.#{script.name}.title",
        "levelgroup_results" => [
          {
            "type" => "text_match",
            "question" => "test",
            "results" => [
              {"result" => "Free response from student 3"},
              {"result" => "This is a different free response"},
              {"result" => "Free response from student 5"},
              {"result" => "This is a free response"},
              {"result" => "Free response from student 4"}
            ],
            "answer_texts" => nil
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {"answer_index" => 0},
              {},
              {},
              {},
              {}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {},
              {},
              {"answer_index" => 2},
              {},
              {"answer_index" => 1}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {},
              {},
              {"answer_index" => 3},
              {},
              {}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {},
              {},
              {},
              {},
              {}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          }
        ]
      }
    ]

    actual_response = JSON.parse(@response.body)
    assert_equal 1, actual_response.length
    assert_equal ['stage', 'levelgroup_results'], actual_response[0].keys
    assert_equal expected_response[0]['stage'], actual_response[0]['stage']
    assert_levelgroup_results_match(
      expected_response[0]['levelgroup_results'],
      actual_response[0]['levelgroup_results']
    )
  end

  test "should get surveys for section with script with single page anonymous level_group assessment" do
    # Seed the RNG deterministically so we get the same "random" shuffling of results.
    srand 1

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
    create :script_level, script: script, levels: [level1], assessment: true

    updated_at = Time.now

    # All students did the LevelGroup, and the free response part of the survey.
    @students.each_with_index do |student, student_index|
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

    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success

    # all these are translation missing because we don't actually generate i18n files in tests
    expected_response = [
      {
        "stage" => "translation missing: en-US.data.script.name.#{script.name}.title",
        "levelgroup_results" => [
          {
            "type" => "text_match",
            "question" => "test",
            "results" => [
              {"result" => "Free response from student 5"},
              {"result" => "Free response from student 4"},
              {"result" => "Free response from student 7"},
              {"result" => "Free response from student 3"},
              {"result" => "Free response from student 6"}
            ],
            "answer_texts" => nil
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {},
              {},
              {},
              {},
              {}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {},
              {},
              {},
              {},
              {}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {},
              {},
              {},
              {},
              {}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          },
          {
            "type" => "multi",
            "question" => "question text",
            "results" => [
              {},
              {},
              {},
              {},
              {}
            ],
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"]
          }
        ]
      }
    ]

    actual_response = JSON.parse(@response.body)
    assert_equal 1, actual_response.length
    assert_equal ['stage', 'levelgroup_results'], actual_response[0].keys
    assert_equal expected_response[0]['stage'], actual_response[0]['stage']
    assert_levelgroup_results_match(
      expected_response[0]['levelgroup_results'],
      actual_response[0]['levelgroup_results']
    )
  end

  test "no anonymous survey data via assessment call" do
    script = create :script

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['anonymous'] = 'true'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # student_1 through student_5 did the survey, just submitting a free response.
    @students.each_with_index do |student, student_index|
      create(
        :activity,
        user: student,
        level: level1,
        level_source: create(
          :level_source,
          level: level1,
          data: %Q({"#{sub_level1.id}":{"result":"Free response from student #{student_index + 3}"},"#{sub_level2.id}":{"result":"-1"},"#{sub_level3.id}":{"result":"-1"},"#{sub_level4.id}":{"result":"-1"}})
        )
      )
    end

    updated_at = Time.now

    @students.each do |student|
      create :user_level, user: student, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at
    end

    # We can retrieve this with the survey API.
    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success
    assert_equal 1, JSON.parse(@response.body).length

    # But importantly, we get an empty result with the assessment API.
    get :section_assessments, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success
    assert_equal [], JSON.parse(@response.body)
  end

  test "no anonymous survey data when less than five students" do
    script = create :script

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level1 = create :level_group, name: 'LevelGroupLevel1', type: 'LevelGroup'
    level1.properties['title'] =  'Long assessment 1'
    level1.properties['anonymous'] = 'true'
    level1.properties['pages'] = [{levels: ['level_free_response', 'level_multi_unsubmitted']}, {levels: ['level_multi_correct', 'level_multi_incorrect']}, {levels: ['level_multi_unattempted']}]
    level1.save!
    create :script_level, script: script, levels: [level1], assessment: true

    # student_1 through student_5 did the survey, just submitting a free response.
    [@student_1, @student_2, @student_3, @student_4].each_with_index do |student, student_index|
      create(
        :activity,
        user: student,
        level: level1,
        level_source: create(
          :level_source,
          level: level1,
          data: %Q({"#{sub_level1.id}":{"result":"Free response from student #{student_index + 3}"},"#{sub_level2.id}":{"result":"-1"},"#{sub_level3.id}":{"result":"-1"},"#{sub_level4.id}":{"result":"-1"}})
        )
      )
    end

    updated_at = Time.now

    [@student_1, @student_2, @student_3, @student_4].each do |student|
      create :user_level, user: student, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at
    end

    # We can retrieve this with the survey API, but it will be empty.
    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success
    assert_equal 0, JSON.parse(@response.body).length
  end

  test "should get no text_responses results for section with script without text response" do
    script = Script.find_by_name('course1')

    get :section_text_responses, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success

    assert_equal '[]', @response.body
  end

  test "should get no assessments results for section with script without assessment" do
    script = Script.find_by_name('course1')

    get :section_assessments, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success

    assert_equal '[]', @response.body
  end

  test "should get lock state when no user_level" do
    script, level, stage = create_script_with_lockable_stage

    get :lockable_state, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success
    body = JSON.parse(response.body)

    assert_equal [@section.id.to_s, @flappy_section.id.to_s, @allthings_section.id.to_s], body.keys, "entry for each section"

    # do a bunch of validation on our first section
    section_response = body[@section.id.to_s]
    assert_equal @section.id, section_response['section_id']
    assert_equal @section.name, section_response['section_name']
    assert_equal 1, section_response['stages'].length

    stages_response = section_response['stages']
    assert_equal 1, stages_response.keys.length, '1 stage in our script'
    stage_response = stages_response[stage.id.to_s]
    assert_equal 5, stage_response.length, "entry for each student in section"

    @students.each_with_index do |student, index|
      student_response = stage_response[index]
      assert_equal(
        {
          "user_id" => student.id,
          "level_id" => level.id,
          "script_id" => script.id
        },
        student_response['user_level_data'],
        'user_id, level_id, and script_id for not yet existing user_level'
      )
      assert_equal student.name, student_response['name']
      assert_equal true, student_response['locked'], 'starts out locked'
      assert_equal false, student_response['readonly_answers']
    end

    # do a much more limited set of validation for the flappy section
    flappy_section_response = body[@flappy_section.id.to_s]
    assert_equal @flappy_section.id, flappy_section_response['section_id']
    assert_equal 1, flappy_section_response['stages'][stage.id.to_s].length
    assert_equal @student_flappy_1.name, flappy_section_response['stages'][stage.id.to_s][0]['name']
  end

  test "should get lock state when we have user_levels" do
    script, level, stage = create_script_with_lockable_stage

    # student_1 is unlocked
    create :user_level, user: @student_1, script: script, level: level, submitted: false, unlocked_at: Time.now

    # student_2 can view answers
    create :user_level, user: @student_2, script: script, level: level, submitted: true, readonly_answers: true, unlocked_at: Time.now

    # student_3 has a user_level, but is still locked
    create :user_level, user: @student_3, script: script, level: level, submitted: true, readonly_answers: false

    # student_4 got autolocked while editing
    create :user_level, user: @student_4, script: script, level: level, submitted: false, unlocked_at: 2.days.ago

    # student_5 got autolocked while viewing answers
    create :user_level, user: @student_5, script: script, level: level, submitted: true, readonly_answers: true, unlocked_at: 2.days.ago

    get :lockable_state, params: {section_id: @section.id, script_id: script.id}
    assert_response :success
    body = JSON.parse(response.body)

    student_responses = body[@section.id.to_s]['stages'][stage.id.to_s]
    assert_equal 5, student_responses.length

    # student_1 is unlocked
    student_1_response = student_responses[0]
    assert_equal(
      {
        "user_id" => @student_1.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_1_response['user_level_data']
    )
    assert_equal false, student_1_response['locked']
    assert_equal false, student_1_response['readonly_answers']

    # student_2 is unlocked
    student_2_response = student_responses[1]
    assert_equal(
      {
        "user_id" => @student_2.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_2_response['user_level_data']
    )
    assert_equal false, student_2_response['locked']
    assert_equal true, student_2_response['readonly_answers']

    # student_3 has a user_level, but is still locked
    student_3_response = student_responses[2]
    assert_equal(
      {
        "user_id" => @student_3.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_3_response['user_level_data']
    )
    assert_equal true, student_3_response['locked']
    assert_equal false, student_3_response['readonly_answers']

    # student_4 got autolocked while editing
    student_4_response = student_responses[3]
    assert_equal(
      {
        "user_id" => @student_4.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_4_response['user_level_data']
    )
    assert_equal true, student_4_response['locked']
    assert_equal false, student_4_response['readonly_answers']

    # student_5 got autolocked while viewing answers
    student_5_response = student_responses[4]
    assert_equal(
      {
        "user_id" => @student_5.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_5_response['user_level_data']
    )
    assert_equal true, student_5_response['locked']
    assert_equal false, student_5_response['readonly_answers']
  end

  test "should update lockable state for new user_levels" do
    script, level, _ = create_script_with_lockable_stage

    user_level_data = {user_id: @student_1.id, level_id: level.id, script_id: script.id}
    user_level_data2 = {user_id: @student_2.id, level_id: level.id, script_id: script.id}

    # unlock a user_level that does not yet exist
    assert_nil UserLevel.find_by(user_level_data)
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: false
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal false, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
    assert_not_nil user_level.unlocked_at

    # view_anwers for a user_level that does not yet exist
    user_level.delete
    assert_nil UserLevel.find_by(user_level_data)
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: true
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal true, user_level.submitted?
    assert_equal true, user_level.readonly_answers?
    assert_not_nil user_level.unlocked_at

    # multiple updates at once
    user_level.delete
    assert_nil UserLevel.find_by(user_level_data)
    assert_nil UserLevel.find_by(user_level_data2)
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: false
      },
      {
        user_level_data: user_level_data2,
        locked: false,
        readonly_answers: false
      }
    ]
    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal false, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
    assert_not_nil user_level.unlocked_at

    user_level2 = UserLevel.find_by(user_level_data2)
    assert_equal false, user_level2.submitted?
    assert_equal false, user_level2.readonly_answers?
    assert_not_nil user_level2.unlocked_at
  end

  test "should update lockable state for existing levels" do
    script, level, _ = create_script_with_lockable_stage

    user_level_data = {user_id: @student_1.id, level_id: level.id, script_id: script.id}
    user_level = create :user_level, user_level_data

    # update from editable to locked
    user_level.update!(submitted: false, unlocked_at: Time.now, readonly_answers: false)
    updates = [
      {
        user_level_data: user_level_data,
        locked: true,
        readonly_answers: false
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal true, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
    assert_nil user_level.unlocked_at

    # update from editable to readonly_answers
    user_level.update!(submitted: false, unlocked_at: Time.now, readonly_answers: false)
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: true
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal true, user_level.submitted?
    assert_equal true, user_level.readonly_answers?
    assert_not_nil user_level.unlocked_at

    # update from readonly_answers to locked
    user_level.update!(submitted: true, unlocked_at: Time.now, readonly_answers: true)
    updates = [
      {
        user_level_data: user_level_data,
        locked: true,
        readonly_answers: false
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal true, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
    assert_nil user_level.unlocked_at

    # update from readonly_answers to editable
    user_level.update!(submitted: true, unlocked_at: Time.now, readonly_answers: true)
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: false
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal false, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
    assert_not_nil user_level.unlocked_at
  end

  test "should fail to update lockable state if given bad data" do
    script, level, _ = create_script_with_lockable_stage

    user_level_data = {user_id: @student_1.id, level_id: level.id, script_id: script.id}
    create :user_level, user_level_data

    # fails if we don't provide all user_level_data
    updates = [
      {
        user_level_data: {
          # missing user_id
          level_id: level.id,
          script_id: script.id
        },
        locked: true,
        readonly_answers: false
      }
    ]
    post :update_lockable_state, params: {updates: updates}
    assert_response 400

    updates = [
      {
        user_level_data: {
          user_id: @student_1.id,
          # missing level_id
          script_id: script.id
        },
        locked: true,
        readonly_answers: false
      }
    ]
    post :update_lockable_state, params: {updates: updates}
    assert_response 400

    updates = [
      {
        user_level_data: {
          user_id: @student_1.id,
          level_id: level.id
          # missing script_id
        },
        locked: true,
        readonly_answers: false
      }
    ]
    post :update_lockable_state, params: {updates: updates}
    assert_response 400

    # can't set to lockable and readonly_answers
    updates = [
      {
        user_level_data: user_level_data,
        locked: true,
        readonly_answers: true
      }
    ]
    post :update_lockable_state, params: {updates: updates}
    assert_response 400

    # can't update students that dont belong to teacher
    other_student = create :student
    updates = [
      {
        user_level_data: {
          user_id: other_student.id,
          level_id: level.id,
          script_id: script.id
        },
        locked: true,
        readonly_answers: false
      }
    ]
    post :update_lockable_state, params: {updates: updates}
    assert_response 403
  end

  test "should get user progress" do
    script = Script.twenty_hour_script

    user = create :user, total_lines: 2
    create :user_level, user: user, best_result: 100, script: script, level: script.script_levels[1].level
    sign_in user

    # Test user progress.
    get :user_progress, params: {script: script.name}
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal 2, body['linesOfCode']
    script_level = script.script_levels[1]
    level_id = script_level.level.id
    assert_equal 'perfect', body['levels'][level_id.to_s]['status']
    assert_equal 100, body['levels'][level_id.to_s]['result']
  end

  test "should get user progress for stage" do
    slogger = FakeSlogger.new
    CDO.set_slogger_for_test(slogger)
    script = Script.hoc_2014_script

    user = create :user, total_lines: 2
    sign_in user

    script_level = script.script_levels[0]
    level = script_level.level
    level_source = create :level_source, level: level, data: 'level source'

    create :user_level, user: user, best_result: 100, script: script,
      level: level, level_source: level_source
    create :activity, user: user, level: level, level_source: level_source

    get :user_progress_for_stage, params: {
      script: script.name,
      stage_position: 1,
      level_position: 1
    }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal nil, body['disableSocialShare']
    assert_equal 100, body['progress'][level.id.to_s]
    assert_equal 'level source', body['lastAttempt']['source']

    assert_equal(
      [
        {
          application: :dashboard,
          tag: 'activity_start',
          script_level_id: script_level.id,
          level_id: level.id,
          user_agent: 'Rails Testing',
          locale: :'en-US'
        }
      ],
      slogger.records
    )
  end

  test "should slog the contained level id when present" do
    slogger = FakeSlogger.new
    CDO.set_slogger_for_test(slogger)
    script = create :script
    stage = create :stage, script: script
    contained_level = create :multi, name: 'multi level'
    level = create :maze, name: 'maze level', contained_level_names: ['multi level']
    create :script_level, script: script, stage: stage, levels: [level]

    user = create :user
    sign_in user

    get :user_progress_for_stage, params: {
      script: script.name,
      stage_position: 1,
      level_position: 1
    }

    assert_equal(contained_level.id, slogger.records.first[:level_id])
  end

  test "should get user progress for stage for signed-out user" do
    slogger = FakeSlogger.new
    CDO.set_slogger_for_test(slogger)
    script = Script.hoc_2014_script
    script_level = script.script_levels[0]
    level = script_level.level

    user = create :user
    sign_out user

    get :user_progress_for_stage, params: {
      script: script.name,
      stage_position: 1,
      level_position: 1
    }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal({"linesOfCode" => 0, "linesOfCodeText" => 'Total lines of code: 0'}, body)
    assert_equal(
      [
        {
          application: :dashboard,
          tag: 'activity_start',
          script_level_id: script_level.id,
          level_id: level.id,
          user_agent: 'Rails Testing',
          locale: :'en-US'
        }
      ],
      slogger.records
    )
  end

  test "should get user progress for stage with young student" do
    script = Script.twenty_hour_script
    young_student = create :young_student
    sign_in young_student

    get :user_progress_for_stage, params: {
      script: script.name,
      stage_position: 1,
      level_position: 1
    }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal true, body['disableSocialShare']
    assert_equal({}, body['progress'])
  end

  test "should get user progress for disabled milestone posts" do
    Gatekeeper.set('postMilestone', value: false)
    script = Script.course1_script
    user = create :user, total_lines: 2
    sign_in user

    get :user_progress_for_stage, params: {
      script: script.name,
      stage_position: 1,
      level_position: 1
    }
    assert_response :success
  end

  test "should get user progress for stage with swapped level" do
    sign_in @student_1
    script = create :script
    stage = create :stage, script: script
    level1a = create :maze, name: 'maze 1'
    level1b = create :maze, name: 'maze 1 new'
    level_source = create :level_source, level: level1a, data: 'level source'
    create :script_level, script: script, stage: stage, levels: [level1a, level1b], properties: {'maze 1': {'active': false}}
    create :user_level, user: @student_1, script: script, level: level1a, level_source: level_source
    create :activity, user: @student_1, level: level1a, level_source: level_source

    get :user_progress_for_stage, params: {
      script: script.name,
      stage_position: 1,
      level_position: 1,
      level: level1a.id
    }
    body = JSON.parse(response.body)
    assert_equal('level source', body['lastAttempt']['source'])
  end

  test "should get progress for section with section script" do
    Script.stubs(:should_cache?).returns true

    assert_queries 8 do
      get :section_progress, params: {section_id: @flappy_section.id}
    end
    assert_response :success

    data = JSON.parse(@response.body)
    expected = {
      'script' => {
        'id' => Script.get_from_cache(Script::FLAPPY_NAME).id,
        'name' => 'Flappy Code',
        'levels_count' => 10,
        'stages' => [{
          'length' => 10,
          'title' => 'Flappy Code'
        }]
      },
      'students' => [{
        'id' => @student_flappy_1.id,
        'levels' => (1..10).map {|level_num| ['not_tried', level_num, "/flappy/#{level_num}"]}
      }]
    }

    assert_equal expected, data
  end

  test "should get paginated progress" do
    get :section_progress, params: {section_id: @section.id, page: 1, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].length

    get :section_progress, params: {section_id: @section.id, page: 2, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].length

    # third page has only one student (of 5 total)
    get :section_progress, params: {section_id: @section.id, page: 3, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['students'].length

    # if we request 1 per page, page 6 should still work (because page 5 gave
    # us a full page of data), but page 7 should fail
    get :section_progress, params: {section_id: @section.id, page: 6, per: 1}
    assert_response :success
    get :section_progress, params: {section_id: @section.id, page: 7, per: 1}
    assert_response 416
  end

  test "should get progress for section with specific script" do
    script = Script.find_by_name('algebra')

    get :section_progress, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success

    assert_equal script.id, JSON.parse(@response.body)['script']['id']
  end

  test "should get paginated progress with specific script" do
    script = Script.find_by_name('algebra')

    get :section_progress, params: {section_id: @section.id, script_id: script.id, page: 1, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].length
    assert_equal script.id, data['script']['id']

    get :section_progress, params: {section_id: @section.id, script_id: script.id, page: 2, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].length

    # third page has only one student (of 5 total)
    get :section_progress, params: {section_id: @section.id, script_id: script.id, page: 3, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['students'].length
  end

  test "should get paginated section level progress" do
    get :section_level_progress, params: {section_id: @section.id, page: 1, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].keys.length

    get :section_level_progress, params: {section_id: @section.id, page: 2, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].keys.length

    # third page has only one student (of 5 total)
    get :section_level_progress, params: {section_id: @section.id, page: 3, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['students'].keys.length

    # if we request 1 per page, page 6 should still work (because page 5 gave
    # us a full page of data), but page 7 should fail
    get :section_level_progress, params: {section_id: @section.id, page: 6, per: 1}
    assert_response :success
    get :section_level_progress, params: {section_id: @section.id, page: 7, per: 1}
    assert_response 416
  end

  test "should get section level progress with specific script" do
    script = Script.find_by_name('algebra')

    get :section_level_progress, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success
  end

  test "should get paginated section level progress with specific script" do
    script = Script.find_by_name('algebra')

    get :section_level_progress, params: {section_id: @section.id, script_id: script.id, page: 1, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].keys.length

    get :section_level_progress, params: {section_id: @section.id, script_id: script.id, page: 2, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].keys.length

    # third page has only one student (of 5 total)
    get :section_level_progress, params: {section_id: @section.id, script_id: script.id, page: 3, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['students'].keys.length
  end

  test "should get paired icons for paired user levels" do
    sl = create :script_level
    driver_ul = create(
      :user_level,
      user: @student_4,
      level: sl.level,
      script: sl.script,
      best_result: 100
    )
    navigator_ul = create(
      :user_level,
      user: @student_5,
      level: sl.level,
      script: sl.script,
      best_result: 100
    )
    create :paired_user_level, driver_user_level: driver_ul, navigator_user_level: navigator_ul

    get :section_progress, params: {
      section_id: @section.id,
      script_id: sl.script.id
    }
    assert_response :success
    parsed = JSON.parse(response.body)

    assert_match /paired/, parsed['students'][3]['levels'].first[0]
    assert_match /paired/, parsed['students'][4]['levels'].first[0]
  end

  test "should get progress for section with section script when blank script is specified" do
    get :section_progress, params: {
      section_id: @flappy_section.id,
      script_id: ''
    }
    assert_response :success

    assert_equal Script.get_from_cache(Script::FLAPPY_NAME).id, JSON.parse(@response.body)['script']['id']
  end

  test "should not return progress for bonus levels" do
    script = create :script
    stage = create :stage, script: script
    create :script_level, script: script, stage: stage
    create :script_level, script: script, stage: stage, bonus: true

    get :section_progress, params: {
      section_id: @flappy_section.id,
      script_id: script.id
    }

    assert_response :success

    response = JSON.parse(@response.body)
    assert_equal 1, response["students"][0]["levels"].length
    assert_equal 1, response["script"]["levels_count"]
    assert_equal 1, response["script"]["stages"][0]["length"]
  end

  test "should get progress for student in section" do
    get :student_progress, params: {
      student_id: @student_1.id,
      section_id: @section.id
    }
    assert_response :success

    response = JSON.parse(@response.body)

    assert_not_nil response["progressHtml"]
    expected_student = {"id" => @student_1.id, "name" => @student_1.name}
    assert_equal expected_student, response["student"]
    expected_script = {"id" => Script.twenty_hour_script.id, "name" => Script.twenty_hour_script.localized_title}
    assert_equal expected_script, response["script"]
  end

  test "should get progress for student in section with section script" do
    get :student_progress, params: {
      student_id: @student_flappy_1.id,
      section_id: @flappy_section.id
    }
    assert_response :success

    response = JSON.parse(@response.body)
    expected_script = {"id" => Script.flappy_script.id, "name" => Script.flappy_script.localized_title}
    assert_equal expected_script, response["script"]
  end

  test "should get progress for student in section with specified script" do
    script = Script.find_by_name('algebra')
    get :student_progress, params: {
      student_id: @student_flappy_1.id,
      section_id: @flappy_section.id,
      script_id: script.id
    }
    assert_response :success

    response = JSON.parse(@response.body)
    expected_script = {"id" => script.id, "name" => script.localized_title}
    assert_equal expected_script, response["script"]
  end

  test "should get user_hero for teacher" do
    sign_in @teacher
    get :user_hero

    assert_select '#welcome.teacher'
    assert_select '.teacherdashboard'
  end

  test "should get user_hero for student with script" do
    user_script = create(:user_script, script: Script.get_from_cache(Script::FLAPPY_NAME))
    sign_in user_script.user

    get :user_hero

    assert_select '#welcome.student'
    assert_select '#currentprogress', true, "Response was: #{@response.body}"
  end

  test "should get user_hero for student with no script" do
    sign_in @student_1
    get :user_hero

    assert_select '#welcome.student'
    assert_select '#suggestcourse', I18n.t('home.no_primary_course')
  end

  test "should get user_hero for student who completed all scripts" do
    student = create :student
    sign_in student
    advertised_scripts = [
      Script.hoc_2014_script, Script.frozen_script, Script.infinity_script,
      Script.flappy_script, Script.playlab_script, Script.artist_script,
      Script.course1_script, Script.course2_script, Script.course3_script,
      Script.course4_script, Script.twenty_hour_script, Script.starwars_script,
      Script.starwars_blocks_script, Script.minecraft_script
    ]
    advertised_scripts.each do |script|
      UserScript.create!(user_id: student.id, script_id: script.id, completed_at: Time.now)
    end
    get :user_hero

    assert_select '#welcome.student'
    assert_select '#suggestcourse', I18n.t(
      'home.student_finished',
      online_link: I18n.t('home.online'),
      local_school_link: I18n.t('home.local_school')
    )
  end

  test "user menu should open pairing dialog if asked to in the session" do
    sign_in create(:student)

    session[:show_pairing_dialog] = true

    get :user_menu

    assert_select 'script', /dashboard.pairing.init.*true/
    refute session[:show_pairing_dialog] # should only show once
  end

  test "user menu should not open pairing dialog if not asked to in the session" do
    sign_in create(:student)

    session[:show_pairing_dialog] = nil

    get :user_menu

    assert_select 'script', /dashboard.pairing.init.*false/
    refute session[:show_pairing_dialog] # should only show once
  end

  test 'student does not see links to teacher dashboard' do
    student = create :student
    sign_in student

    get :user_menu

    assert_response :success
    assert_select 'a[href="//test.code.org/teacher-dashboard"]', 0
  end

  test 'should show sign in link for signed out user' do
    sign_out :user
    get :user_menu

    assert_response :success
    assert_select 'a[href="//test-studio.code.org/users/sign_in"]', 'Sign in'
  end

  test 'should show sign out link for signed in user' do
    student = create :student
    sign_in student

    get :user_menu

    assert_response :success
    assert_select 'a[href="//test-studio.code.org/users/sign_out"]', 'Sign out'
  end

  test 'show link to pair programming when in a section' do
    student = create(:follower).student_user
    sign_in student

    assert student.can_pair?

    get :user_menu

    assert_response :success
    assert_select '#pairing_link'
  end

  test "don't show link to pair programming when not in a section" do
    student = create(:student)
    sign_in student

    get :user_menu

    assert_response :success
    assert_select 'a[href="http://test.host/pairing"]', false
  end

  test "don't show assessment to teacher who doesn't own that section" do
    script = create :script

    sign_out @teacher
    sign_in @teacher_other

    get :section_assessments, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :forbidden
  end

  test "don't show assessment to student who doesn't own that section" do
    script = create :script

    sign_out @teacher
    sign_in @student_1

    get :section_assessments, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :forbidden
  end

  test "don't show assessment to signed out user" do
    script = create :script

    sign_out @teacher

    get :section_assessments, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :redirect
  end

  test "don't show survey to teacher who doesn't own that section" do
    script = create :script

    sign_out @teacher
    sign_in @teacher_other

    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :forbidden
  end

  test "don't show survey to student who doesn't own that section" do
    script = create :script

    sign_out @teacher
    sign_in @student_1

    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :forbidden
  end

  test "don't show survey to signed out user" do
    script = create :script

    sign_out @teacher

    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :redirect
  end

  test 'api routing' do
    # /dashboardapi urls
    assert_routing(
      {method: "get", path: "/dashboardapi/user_menu"},
      {controller: "api", action: "user_menu"}
    )

    assert_routing(
      {method: "get", path: "/dashboardapi/section_progress/2"},
      {controller: "api", action: "section_progress", section_id: '2'}
    )

    assert_routing(
      {method: "get", path: "/dashboardapi/student_progress/2/15"},
      {controller: "api", action: "student_progress", section_id: '2', student_id: '15'}
    )

    # /api urls
    assert_recognizes(
      {controller: "api", action: "user_menu"},
      {method: "get", path: "/api/user_menu"}
    )

    assert_recognizes(
      {controller: "api", action: "section_progress", section_id: '2'},
      {method: "get", path: "/api/section_progress/2"}
    )

    assert_recognizes(
      {controller: "api", action: "student_progress", section_id: '2', student_id: '15'},
      {method: "get", path: "/api/student_progress/2/15"}
    )
  end

  #
  # Given two arrays, checks that they represent equivalent bags (or multisets)
  # of elements.
  #
  # Equivalent:     [1, 1, 2], [1, 2, 1]
  # Not equivalent: [1, 1, 2], [1, 2, 2]
  #
  # Optionally takes a comparator block.  If omitted, == comparison is used.
  #
  # equivalent_bags?([2, 3, 4], [12, 13, 14]) {|a,b| a%10 == b%10}
  #
  # @param [Array] bag_a
  # @param [Array] bag_b
  # @param [Block] (optional) comparator
  # @return [Boolean] true if sets are equivalent, false if not
  #
  def equivalent_bags?(bag_a, bag_b)
    bag_b_remaining = bag_b.clone
    bag_a.each do |a|
      match_index = bag_b_remaining.find_index do |b|
        if block_given?
          yield a, b
        else
          a == b
        end
      end
      if match_index.nil?
        return false
      else
        bag_b_remaining.delete_at match_index
      end
    end
    bag_b_remaining.empty?
  end

  test 'equivalent_bags? helper' do
    assert equivalent_bags? [], []
    assert equivalent_bags? [1, 1, 1, 2, 2], [2, 1, 2, 1, 1]
    refute equivalent_bags? [1, 1, 1, 2, 2], [1, 1, 2, 2, 2]
    assert equivalent_bags?([2, 3, 4], [12, 13, 14]) {|a, b| a % 10 == b % 10}
    refute equivalent_bags?([2, 3, 4], [11, 12, 13]) {|a, b| a % 10 == b % 10}
  end

  def assert_levelgroup_results_match(expected_results, actual_results)
    match = equivalent_bags?(expected_results, actual_results) do |expected, actual|
      expected['type'] == actual['type'] &&
        expected['question'] == actual['question'] &&
        expected['answer_texts'] == actual['answer_texts'] &&
        equivalent_bags?(expected['results'], actual['results'])
    end
    assert match, <<MESSAGE
Mismatched results:

Expected:

#{expected_results.join("\n")}

Actual:

#{actual_results.join("\n")}

MESSAGE
  end
end
