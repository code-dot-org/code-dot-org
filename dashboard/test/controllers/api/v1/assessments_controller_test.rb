require 'test_helper'

class Api::V1::AssessmentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @teacher.permission = UserPermission::AUTHORIZED_TEACHER
    @section = create(:section, user: @teacher, login_type: 'word')

    # Set of students in section.
    @students = []
    5.times do |i|
      student = create(:student, name: "student_#{i}")
      @students << student
      create(:follower, section: @section, student_user: student)
    end
    @student_1, @student_2, @student_3, @student_4, @student_5 = @students

    @teacher_other = create(:teacher)
    @teacher_other.permission = UserPermission::AUTHORIZED_TEACHER
  end

  # index tests - gets assessment questions and answers
  test 'logged out cannot get assessment questions and answers' do
    get :index
    assert_response :forbidden
  end

  test 'students cannot get assessment questions and answers' do
    sign_in @student_1
    get :index
    assert_response :forbidden
  end

  test 'non-verified teacher cannot get assessment questions and answers' do
    non_verified_teacher = create(:teacher)
    section = create(:section, user: non_verified_teacher, login_type: 'word')
    create(:follower, section: section).student_user

    sign_in non_verified_teacher
    get :index
    assert_response :forbidden
  end

  test 'verified teacher can get assessment questions and answers' do
    sign_in @teacher
    get :index, params: {section_id: @section.id, script_id: 2}
    assert_response :success
    assert_equal '{}', @response.body
  end

  test "verified teacher should get assessments structure" do
    # Sign in and create a new script.
    sign_in @teacher
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    # Set up an assessment for that script.
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    sub_level5 = create :multi, name: 'level_multi_unattempted', type: 'Multi'
    sub_level6 = create :match, name: 'level_match_unsubmitted', type: 'Match', properties: {
      answers: [{text: "one"}, {text: "two"}],
      questions: [{text: "one"}, {text: "two"}]
    }
    sub_level7 = create :match, name: 'level_match_correct', type: 'Match', properties: {
      answers: [{text: "one"}, {text: "two"}],
      questions: [{text: "one"}, {text: "two"}]
    }
    sub_level8 = create :match, name: 'level_match_incorrect', type: 'Match', properties: {
      answers: [{text: "one"}, {text: "two"}],
      questions: [{text: "one"}, {text: "two"}]
    }

    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Long assessment 1'

      page
      level 'level_free_response'
      level 'level_multi_unsubmitted'

      page
      level 'level_multi_correct'
      level 'level_multi_incorrect'

      page
      level 'level_match_unsubmitted'
      level 'level_match_correct'
      level 'level_match_incorrect'

      page
      level 'level_multi_unattempted'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})

    create :script_level, script: script, levels: [level1], assessment: true, lesson: lesson

    # Call the controller method.
    get :index, params: {
      section_id: @section.id,
      script_id: script.id
    }

    assert_response :success

    expected_answers = [
      {"text" => "answer1", "correct" => true},
      {"text" => "answer2", "correct" => false},
      {"text" => "answer3", "correct" => false},
      {"text" => "answer4", "correct" => false}
    ]

    expected_match_answers = [{"text" => "one"}, {"text" => "two"}]
    expected_match_options = [{"text" => "one"}, {"text" => "two"}]

    expected_questions = [
      {"level_id" => sub_level1.id.to_s, "type" => "TextMatch", "name" => sub_level1.name,
        "display_name" => nil, "title" => "title", "question_text" => nil, "question_index" => 0},
      {"level_id" => sub_level2.id.to_s, "type" => "Multi", "name" => sub_level2.name,
        "display_name" => nil, "answers" => expected_answers, "question_text" => sub_level2.get_question_text, "question_index" => 1},
      {"level_id" => sub_level3.id.to_s, "type" => "Multi", "name" => sub_level3.name,
        "display_name" => nil, "answers" => expected_answers, "question_text" => sub_level3.get_question_text, "question_index" => 2},
      {"level_id" => sub_level4.id.to_s, "type" => "Multi", "name" => sub_level4.name,
        "display_name" => nil, "answers" => expected_answers, "question_text" => sub_level4.get_question_text, "question_index" => 3},
      {"level_id" => sub_level6.id.to_s, "type" => "Match", "name" => sub_level6.name,
       "display_name" => nil, "answers" => expected_match_answers, "options" => expected_match_options, "question_text" => sub_level6.get_question_text, "question" => sub_level6.question, "question_index" => 4},
      {"level_id" => sub_level7.id.to_s, "type" => "Match", "name" => sub_level7.name,
       "display_name" => nil, "answers" => expected_match_answers, "options" => expected_match_options, "question_text" => sub_level7.get_question_text, "question" => sub_level7.question, "question_index" => 5},
      {"level_id" => sub_level8.id.to_s, "type" => "Match", "name" => sub_level8.name,
       "display_name" => nil, "answers" => expected_match_answers, "options" => expected_match_options, "question_text" => sub_level8.get_question_text, "question" => sub_level8.question, "question_index" => 6},
      {"level_id" => sub_level5.id.to_s, "type" => "Multi", "name" => sub_level5.name,
        "display_name" => nil, "answers" => expected_answers, "question_text" => sub_level5.get_question_text, "question_index" => 7},
    ]
    level_response = JSON.parse(@response.body)[level1.id.to_s]
    assert_equal script.name, level_response["name"]
    assert_equal level1.id.to_s, level_response["id"]
    assert_equal expected_questions, level_response["questions"]
  end

  # section_responses tests - gets student responses to assessment
  test 'logged out cannot get assessment responses from students' do
    get :section_responses
    assert_response :forbidden
  end

  test "don't show assessment responses to teacher who doesn't own that section" do
    script = create :script
    sign_in @teacher_other

    get :section_responses, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :forbidden
  end

  test 'students cannot get assessment responses from students' do
    sign_in @student_1
    get :section_responses
    assert_response :forbidden
  end

  test 'gets no assessment responses from students when no assessment' do
    sign_in @teacher
    get :section_responses, params: {section_id: @section.id, script_id: 2}
    assert_response :success
    assert_equal '{}', @response.body
  end

  test "verified teacher should get assessments responses" do
    # Sign in and create a new script.
    sign_in @teacher
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    # Set up an assessment for that script.
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'
    sub_level5 = create :match, name: 'level_match_unsubmitted', type: 'Match', properties: {
      answers: [{text: "one"}, {text: "two"}],
      questions: [{text: "one"}, {text: "two"}]
    }
    sub_level6 = create :match, name: 'level_match_correct', type: 'Match', properties: {
      answers: [{text: "one"}, {text: "two"}],
      questions: [{text: "one"}, {text: "two"}]
    }
    sub_level7 = create :match, name: 'level_match_incorrect', type: 'Match', properties: {
      answers: [{text: "one"}, {text: "two"}],
      questions: [{text: "one"}, {text: "two"}]
    }

    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Long assessment 1'

      page
      level 'level_free_response'
      level 'level_multi_unsubmitted'

      page
      level 'level_multi_correct'
      level 'level_multi_incorrect'

      page
      level 'level_match_unsubmitted'
      level 'level_match_correct'
      level 'level_match_incorrect'

      page
      level 'level_multi_unattempted'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})

    create :script_level, script: script, levels: [level1], assessment: true, lesson: lesson

    # Student has completed an assessment.
    level_source = create(
      :level_source,
      level: level1,
      data: %Q({"#{sub_level1.id}":{"result":"This is a free response"},"#{sub_level2.id}":{"result":"0"},"#{sub_level3.id}":{"result":"1"},"#{sub_level4.id}":{"result":"-1"},"#{sub_level5.id}":{"result":","},"#{sub_level6.id}":{"result":"0,1"},"#{sub_level7.id}":{"result":"1,0"}})
    )
    create :activity, user: @student_1, level: level1,
      level_source: level_source

    updated_at = Time.now

    user_level = create :user_level, user: @student_1, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at, level_source: level_source

    # Call the controller method.
    get :section_responses, params: {
      section_id: @section.id,
      script_id: script.id
    }

    assert_response :success

    expected_response = {
      @student_1.id.to_s => {
        "student_name" => @student_1.name,
        "responses_by_assessment" => {
          level1.id.to_s => {
            "stage" => script.name,
            "puzzle" => 1,
            "question" => "Long assessment 1",
            "url" => "http://test.host/s/#{script.name}/lessons/1/levels/1?section_id=#{@section.id}&user_id=#{@student_1.id}",
            "multi_correct" => 1,
            "multi_count" => 4,
            "match_correct" => 1,
            "match_count" => 3,
            "submitted" => true,
            "timestamp" => user_level[:updated_at],
            "level_results" => [
              {"student_result" => "This is a free response", "status" => "", "type" => "FreeResponse"},
              {"type" => "Multi", "student_result" => [0], "status" => "correct",},
              {"type" => "Multi", "student_result" => [1], "status" => "incorrect",},
              {"type" => "Multi", "student_result" => [], "status" => "unsubmitted",},
              {"type" => "Match", "student_result" => [nil, nil], "status" => ["unsubmitted", "unsubmitted"],},
              {"type" => "Match", "student_result" => [0, 1], "status" => ["submitted", "submitted"],},
              {"type" => "Match", "student_result" => [1, 0], "status" => ["submitted", "submitted"],},
              {"type" => "Multi", "status" => "unsubmitted"}
            ]
          }
        }
      }
    }
    assert_equal expected_response, JSON.parse(@response.body)
  end

  test "multi choose 2 questions are only correct if both answers are correct" do
    # Sign in and create a new script.
    sign_in @teacher
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    # Set up an assessment for that script.
    sub_level1 = create :multi, name: 'level_multi2_correct', type: 'Multi',
                        properties: {"answers": [{"text" => "Incorrect Answer", "correct" => false},
                                                 {"text" => "Incorrect Answer", "correct" => false},
                                                 {"text" => "Correct Answer", "correct" => true},
                                                 {"text" => "Correct Answer", "correct" => true}]}
    sub_level2 = create :multi, name: 'level_multi2_incorrect_only_one_choice', type: 'Multi',
                        properties: {"answers": [{"text" => "Incorrect Answer", "correct" => false},
                                                 {"text" => "Incorrect Answer", "correct" => false},
                                                 {"text" => "Correct Answer", "correct" => true},
                                                 {"text" => "Correct Answer", "correct" => true}]}

    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Long assessment 1'

      page
      level 'level_multi2_correct'
      level 'level_multi2_incorrect_only_one_choice'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})

    create :script_level, script: script, levels: [level1], assessment: true, lesson: lesson

    # Student has completed an assessment.
    level_source = create(
      :level_source,
      level: level1,
      data: %Q({"#{sub_level1.id}":{"result":"2,3"},"#{sub_level2.id}":{"result":"3"}})
    )
    create :activity, user: @student_1, level: level1,
           level_source: level_source

    updated_at = Time.now

    user_level = create :user_level, user: @student_1, best_result: 100, script: script, level: level1, submitted: true, updated_at: updated_at, level_source: level_source

    # Call the controller method.
    get :section_responses, params: {
      section_id: @section.id,
      script_id: script.id
    }

    assert_response :success

    expected_response = {
      @student_1.id.to_s => {
        "student_name" => @student_1.name,
          "responses_by_assessment" => {
            level1.id.to_s => {
              "stage" => script.name,
              "puzzle" => 1,
              "question" => "Long assessment 1",
              "url" => "http://test.host/s/#{script.name}/lessons/1/levels/1?section_id=#{@section.id}&user_id=#{@student_1.id}",
              "multi_correct" => 1,
              "multi_count" => 2,
              "match_correct" => 0,
              "match_count" => 0,
              "submitted" => true,
              "timestamp" => user_level[:updated_at],
              "level_results" => [
                {"type" => "Multi", "student_result" => [2, 3], "status" => "correct",},
                {"type" => "Multi", "student_result" => [3], "status" => "incorrect",}
              ]
            }
          }
      }
    }
    assert_equal expected_response, JSON.parse(@response.body)
  end

  test "gets no anonymous survey data via assessment responses call" do
    # Sign in as teacher and create a new script.
    sign_in @teacher
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    # Set up an anonymous assessment in that script.
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Long assessment 1'
      anonymous 'true'

      page
      level 'level_free_response'
      level 'level_multi_unsubmitted'

      page
      level 'level_multi_correct'
      level 'level_multi_incorrect'

      page
      level 'level_multi_unattempted'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})

    create :script_level, script: script, levels: [level1], assessment: true, lesson: lesson

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
    assert_equal 1, JSON.parse(@response.body).keys.length

    # But, we get an empty result with the assessment responses API because the assessment is anonymous.
    get :section_responses, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :success
    assert_equal '{}', @response.body
  end

  # section_surveys tests - gets the survey questions and anonymous responses
  test 'logged out cannot get survey responses from students' do
    get :section_surveys
    assert_response :forbidden
  end

  test "don't show survey responses to teacher who doesn't own that section" do
    script = create :script
    sign_in @teacher_other

    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }
    assert_response :forbidden
  end

  test 'students cannot get survey responses from students' do
    sign_in @student_1
    get :section_surveys
    assert_response :forbidden
  end

  test 'gets no survey responses from students when no survey' do
    sign_in @teacher
    get :section_surveys, params: {section_id: @section.id, script_id: 2}
    assert_response :success
    assert_equal '{}', @response.body
  end

  test "should get surveys for section with script with anonymous level_group assessment" do
    sign_in @teacher
    # Seed the RNG deterministically so we get the same "random" shuffling of results.
    srand 1

    # Create a script with an anonymous assessment.
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Long assessment 1'
      anonymous 'true'

      page
      level 'level_free_response'
      level 'level_multi_unsubmitted'

      page
      level 'level_multi_correct'
      level 'level_multi_incorrect'

      page
      level 'level_multi_unattempted'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})

    create :script_level, script: script, levels: [level1], assessment: true, lesson: lesson

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

    expected_response = {
      level1.id.to_s => {
        "lesson_name" => script.name,
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
            "answer_texts" => nil,
            "question_index" => 0,
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
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"],
            "question_index" => 1,
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
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"],
            "question_index" => 2,
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
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"],
            "question_index" => 3,
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
            "answer_texts" => ["answer1", "answer2", "answer3", "answer4"],
            "question_index" => 4,
          }
        ]
      }
    }

    actual_response = JSON.parse(@response.body)
    assert_equal expected_response.keys, actual_response.keys
    assert_equal expected_response[level1.id.to_s]['lesson_name'], actual_response[level1.id.to_s]['lesson_name']
    assert_equal expected_response[level1.id.to_s]['levelgroup_results'],
      actual_response[level1.id.to_s]['levelgroup_results']
  end

  test "no anonymous survey data when less than five students" do
    sign_in @teacher
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    sub_level1 = create :text_match, name: 'level_free_response', type: 'TextMatch'
    sub_level2 = create :multi, name: 'level_multi_unsubmitted', type: 'Multi'
    sub_level3 = create :multi, name: 'level_multi_correct', type: 'Multi'
    sub_level4 = create :multi, name: 'level_multi_incorrect', type: 'Multi'
    create :multi, name: 'level_multi_unattempted', type: 'Multi'

    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Long assessment 1'
      anonymous 'true'

      page
      level 'level_free_response'
      level 'level_multi_unsubmitted'

      page
      level 'level_multi_correct'
      level 'level_multi_incorrect'

      page
      level 'level_multi_unattempted'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})

    create :script_level, script: script, levels: [level1], assessment: true, lesson: lesson

    # student_1 through student_4 did the survey, just submitting a free response.
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

    # We can retrieve this with the survey API, but there will be no levelgroup_results.
    get :section_surveys, params: {
      section_id: @section.id,
      script_id: script.id
    }

    expected_response = {
      level1.id.to_s => {
        "lesson_name" => script.name,
        "levelgroup_results" => []
      }
    }

    assert_response :success
    actual_response = JSON.parse(@response.body)
    assert_equal expected_response.keys, actual_response.keys
    assert_equal expected_response[level1.id.to_s]['lesson_name'], actual_response[level1.id.to_s]['lesson_name']
    assert_equal expected_response[level1.id.to_s]['levelgroup_results'],
      actual_response[level1.id.to_s]['levelgroup_results']
  end
end
