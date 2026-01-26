require 'test_helper'

class StudentSnapshotsControllerTest < ActionController::TestCase
  setup do
    sign_in(create(:teacher))
    @unit = create(:unit, name: 'test-unit')
    @lesson_group = create(:lesson_group, script: @unit)
    @lesson1 = create(:lesson,
      script: @unit,
      lesson_group: @lesson_group,
      name: 'Test Lesson 1',
      has_lesson_plan: true,
      lockable: false,
      relative_position: 1
    )
    @lesson2 = create(:lesson,
      script: @unit,
      lesson_group: @lesson_group,
      name: 'Test Lesson 2',
      has_lesson_plan: false,
      lockable: true,
      relative_position: 2
    )
  end

  test "lessons endpoint returns correct format with unit_id" do
    get :lessons, params: {unit_id: @unit.id}

    assert_response :ok

    response_data = JSON.parse(response.body)
    lessons_data = response_data['lessons']
    assert_equal 2, lessons_data.length

    lesson_data = lessons_data.first
    assert_equal @lesson1.id, lesson_data['id'].to_i
    assert_equal 'Test Lesson 1', lesson_data['name']
    assert_equal true, lesson_data['hasLessonPlan']
    assert_equal false, lesson_data['isLockable']
    assert_equal 1, lesson_data['position']
  end

  test "lessons endpoint returns error for invalid unit_id" do
    get :lessons, params: {unit_id: 99999}

    assert_response :bad_request

    response_data = JSON.parse(response.body)
    assert_includes response_data['error'], "Can't find Unit id=99999"
  end

  test "lessons endpoint returns empty array for unit with no lessons" do
    empty_unit = create(:unit, name: 'empty-unit')
    get :lessons, params: {unit_id: empty_unit.id}

    assert_response :ok

    response_data = JSON.parse(response.body)
    assert_equal [], response_data['lessons']
    assert_equal false, response_data['hasUnnumberedLessons']
  end

  test "cfu_levels endpoint returns CFU levels from lesson" do
    # Create levels
    cfu_level = create(:level, name: 'CFU Level 1', type: 'Multi')
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')

    # Create script levels with progression attribute
    cfu_script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Practice', levels: [regular_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 1, cfu_levels.length
    cfu_data = cfu_levels.first
    assert_equal cfu_level.id, cfu_data['id']
    assert_equal 'CFU Level 1', cfu_data['name']
    assert_equal 'CFU Level 1', cfu_data['display_name']
    assert_equal 'Multi', cfu_data['type']
    assert_equal cfu_script_level.id, cfu_data['script_level_id']
    assert_equal 'Check Your Understanding', cfu_data['progression']
    refute_nil cfu_data['progression_display_name']
  end

  test "cfu_levels endpoint matches both Check Your Understanding and Check For Understanding" do
    # Test both progression variants
    cfu_level1 = create(:level, name: 'CFU Level 1', type: 'Multi')
    cfu_level2 = create(:level, name: 'CFU Level 2', type: 'Multi')

    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level1])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check For Understanding', levels: [cfu_level2])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 2, cfu_levels.length
    cfu_ids = cfu_levels.map {|l| l['id']}
    assert_includes cfu_ids, cfu_level1.id
    assert_includes cfu_ids, cfu_level2.id
  end

  test "cfu_levels endpoint returns empty array when no CFU levels exist" do
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Practice', levels: [regular_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    assert_equal [], response_data['cfu_levels']
  end

  test "cfu_levels endpoint returns empty array when script_level has no progression" do
    regular_level = create(:level, name: 'Regular Level', type: 'Multi')
    create(:script_level, script: @unit, lesson: @lesson1, progression: nil, levels: [regular_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    assert_equal [], response_data['cfu_levels']
  end

  test "cfu_levels endpoint returns error for invalid lesson_id" do
    get :cfu_levels, params: {lesson_id: 99999}

    assert_response :bad_request
    response_data = JSON.parse(response.body)
    assert_includes response_data['error'], "Can't find Lesson id=99999"
  end

  test "cfu_levels endpoint handles multiple levels in a script_level" do
    # Create multiple levels for the same script_level
    cfu_level1 = create(:level, name: 'CFU Level 1', type: 'Multi')
    cfu_level2 = create(:level, name: 'CFU Level 2', type: 'Multi')

    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level1, cfu_level2])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_levels = response_data['cfu_levels']

    assert_equal 2, cfu_levels.length
    cfu_ids = cfu_levels.map {|l| l['id']}
    assert_includes cfu_ids, cfu_level1.id
    assert_includes cfu_ids, cfu_level2.id
  end

  test "cfu_levels endpoint includes all required fields" do
    level_answers = [
      {"text" => "answer 1", "correct" => false},
      {"text" => "answer 2", "correct" => true},
      {"text" => "answer 2", "correct" => true},
    ]
    cfu_level_1 = create(:level, name: 'CFU Level 1', type: 'Multi',
      properties: {display_name: 'CFU Display Name', questions: [{text: 'Question text'}], answers: level_answers}
    )
    cfu_level_2 = create(:level, name: 'CFU Level 2', type: 'Match')
    cfu_level_3 = create(:level, name: 'CFU Level 3', type: 'FreeResponse')
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level_1, cfu_level_2, cfu_level_3])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels'].first

    refute_nil cfu_data['id']
    refute_nil cfu_data['name']
    refute_nil cfu_data['display_name']
    refute_nil cfu_data['type']
    refute_nil cfu_data['script_level_id']
    refute_nil cfu_data['progression']
    refute_nil cfu_data['progression_display_name']
    assert_equal 'CFU Display Name', cfu_data['display_name']
    assert_equal cfu_data['question_text'], 'Question text'
    assert_equal cfu_data['answers'], level_answers

    # Ensure level_position is tracked for CFU levels
    assert_equal 1, cfu_data['level_position']
    assert_equal 2, response_data['cfu_levels'][1]['level_position']
    assert_equal 3, response_data['cfu_levels'][2]['level_position']
  end

  test "cfu_levels endpoint includes question and possible answers for level" do
    multi_level_answers = [
      {"text" => "answer 1", "correct" => false},
      {"text" => "answer 2", "correct" => true},
    ]
    match_level_answers = [
      {"text" => "answer 1"},
      {"text" => "answer 2"},
      {"text" => "answer 3"}
    ]

    multi_cfu_level = create(:level, name: 'Multi CFU Level', type: 'Multi',
      properties: {display_name: 'Multi CFU Display Name', questions: [{text: 'Multi question text'}], answers: multi_level_answers}
    )
    match_cfu_level = create(:level, name: 'Match CFU Level', type: 'Match',
      properties: {display_name: 'Match CFU Display Name', content1: 'Match question text', answers: match_level_answers}
    )
    free_res_cfu_level = create(:level, name: 'Free Response CFU Level', type: 'FreeResponse',
      properties: {display_name: 'Free Response CFU Display Name', long_instructions: 'Free Response question text', answers: nil}
    )
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [multi_cfu_level])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [match_cfu_level])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [free_res_cfu_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels']

    assert_equal 'Multi question text', cfu_data[0]['question_text']
    assert_equal multi_level_answers, cfu_data[0]['answers']
    assert_equal 'Match question text', cfu_data[1]['question_text']
    assert_equal match_level_answers, cfu_data[1]['answers']
    assert_equal 'Free Response question text', cfu_data[2]['question_text']
    assert_nil cfu_data[2]['answers']
  end

  test "cfu_levels endpoint includes question and possible answers for level_group" do
    multi_sublevel_answers = [
      {"text" => "answer 1", "correct" => false},
      {"text" => "answer 2", "correct" => true},
    ]
    match_sublevel_answers = [
      {"text" => "answer 1"},
      {"text" => "answer 2"},
      {"text" => "answer 3"}
    ]

    create(:level, name: 'Multi CFU Level', type: 'Multi',
      properties: {display_name: 'Multi CFU Display Name', questions: [{text: 'Multi question text'}], answers: multi_sublevel_answers}
    )
    create(:level, name: 'Match CFU Level', type: 'Match',
      properties: {display_name: 'Match CFU Display Name', content1: 'Match question text', answers: match_sublevel_answers}
    )
    create(:level, name: 'Free Response CFU Level', type: 'FreeResponse',
      properties: {display_name: 'Free Response CFU Display Name', long_instructions: 'Free Response question text', answers: nil}
    )
    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Level Group'
      anonymous 'true'

      page
      level 'Multi CFU Level'
      level 'Match CFU Level'
      level 'Free Response CFU Level'
    DSL
    level1 = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [level1], assessment: true)

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels'].first

    assert_equal ['Multi question text', 'Match question text', 'Free Response question text'], cfu_data['question_text']
    assert_equal [multi_sublevel_answers, match_sublevel_answers, nil], cfu_data['answers']
  end

  test "cfu_levels endpoint uses level name as display_name when display_name is nil" do
    cfu_level = create(:level, name: 'CFU Level', type: 'Multi', display_name: nil)
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level])

    get :cfu_levels, params: {lesson_id: @lesson1.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    cfu_data = response_data['cfu_levels'].first

    assert_equal 'CFU Level', cfu_data['display_name']
  end

  test "cfu_responses endpoint returns error for invalid lesson_id" do
    get :cfu_responses, params: {lesson_id: 99999, student_id: 1}

    assert_response :bad_request
    response_data = JSON.parse(response.body)
    assert_includes response_data['error'], "Can't find Lesson id=99999"
  end

  test "cfu_responses endpoint returns error for invalid student_id" do
    get :cfu_responses, params: {lesson_id: @lesson1.id, student_id: 99999}

    assert_response :bad_request
    response_data = JSON.parse(response.body)
    assert_includes response_data['error'], "Can't find Student id=99999"
  end

  test "cfu_responses endpoint returns responses for CFU levels" do
    # Create a CFU level and associated script_level
    cfu_level = create(:multi, name: 'CFU Level 1')
    cfu_script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [cfu_level])

    # Create a student and a UserLevel with a LevelSource (student answer)
    student = create(:student)
    script = @unit
    level_source = create(:level_source, data: '1')
    create(:user_level, user: student, script: script, level: cfu_level, level_source: level_source, submitted: true)

    get :cfu_responses, params: {lesson_id: @lesson1.id, student_id: student.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    responses = response_data['cfu_responses']

    assert_equal 1, responses.length
    response_entry = responses.first
    assert_equal cfu_level.id, response_entry['level_id']
    assert_equal cfu_script_level.id, response_entry['script_level_id']
    refute_nil response_entry['response']
    assert_equal true, response_entry['submitted']
    refute_nil response_entry['timestamp']
  end

  test "cfu_responses endpoint returns sublevel responses for LevelGroup CFUs" do
    # Create a LevelGroup CFU with a text-input sublevel.
    sublevel = create(:free_response, name: 'CFU Text Sublevel')
    level_group_dsl = <<~DSL
      name 'CFU LevelGroup'
      title 'CFU LevelGroup'
      submittable 'true'

      page
      level '#{sublevel.name}'
    DSL
    level_group = LevelGroup.create_from_level_builder({}, {name: 'cfu_level_group', dsl_text: level_group_dsl})

    cfu_script_level = create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [level_group])

    student = create(:student)
    script = @unit

    # Student submitted the LevelGroup and answered the sublevel.
    create(:user_level, user: student, script: script, level: level_group, submitted: false)
    create(:user_level, user: student, script: script, level: sublevel, level_source: create(:level_source, data: 'hello world'))

    get :cfu_responses, params: {lesson_id: @lesson1.id, student_id: student.id}

    assert_response :ok
    response_data = JSON.parse(response.body)
    responses = response_data['cfu_responses']

    assert_equal 1, responses.length
    response_entry = responses.first
    assert_equal level_group.id, response_entry['level_id']
    assert_equal cfu_script_level.id, response_entry['script_level_id']

    assert_equal 'LevelGroup', response_entry['response']['type']
    assert_equal 1, response_entry['response']['level_results'].length

    sublevel_result = response_entry['response']['level_results'].first
    assert_equal sublevel.id, sublevel_result['level_id']
    assert_equal 'FreeResponse', sublevel_result['type']
    assert_equal 'hello world', sublevel_result['student_result']
  end

  test "cfu_responses endpoint tracks submitted status for CFU levels" do
    multi_level_answers = [
      {"text" => "answer 1", "correct" => false},
      {"text" => "answer 2", "correct" => true},
    ]
    match_level_answers = [
      {"text" => "answer 1"},
      {"text" => "answer 2"},
      {"text" => "answer 3"}
    ]

    multi_cfu_level = create(:level, name: 'Multi CFU Level', type: 'Multi',
      properties: {display_name: 'Multi CFU Display Name', questions: [{text: 'Multi question text'}], answers: multi_level_answers}
    )
    match_cfu_level = create(:level, name: 'Match CFU Level', type: 'Match',
      properties: {display_name: 'Match CFU Display Name', content1: 'Match question text', answers: match_level_answers}
    )
    free_res_cfu_level = create(:level, name: 'Free Response CFU Level', type: 'FreeResponse',
      properties: {display_name: 'Free Response CFU Display Name', long_instructions: 'Free Response question text', answers: nil}
    )
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [multi_cfu_level])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [match_cfu_level])
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [free_res_cfu_level])

    student_with_submitted_levels = create(:student)
    create(:user_level, user: student_with_submitted_levels, script: @unit, level: multi_cfu_level, level_source: create(:level_source, data: '1'))
    create(:user_level, user: student_with_submitted_levels, script: @unit, level: match_cfu_level, level_source: create(:level_source, data: '0,2,1'))
    create(:user_level, user: student_with_submitted_levels, script: @unit, level: free_res_cfu_level, level_source: create(:level_source, data: 'Sample free response text'))

    student_with_unsubmitted_levels = create(:student)
    create(:user_level, user: student_with_unsubmitted_levels, script: @unit, level: multi_cfu_level, level_source: create(:level_source, data: '-1'))
    create(:user_level, user: student_with_unsubmitted_levels, script: @unit, level: match_cfu_level, level_source: create(:level_source, data: ''))
    create(:user_level, user: student_with_unsubmitted_levels, script: @unit, level: free_res_cfu_level, level_source: create(:level_source, data: ''))

    get :cfu_responses, params: {lesson_id: @lesson1.id, student_id: student_with_submitted_levels.id}
    assert_response :ok
    response_data = JSON.parse(response.body)
    responses = response_data['cfu_responses']
    # Correct response
    assert_equal true, responses[0]['submitted']
    assert_equal 'correct', responses[0]['response']['status']
    # Incorrect response
    assert_equal true, responses[1]['submitted']
    assert_equal 'incorrect', responses[1]['response']['status']
    # Submitted free response
    assert_equal true, responses[2]['submitted']
    assert_equal 'submitted', responses[2]['response']['status']

    get :cfu_responses, params: {lesson_id: @lesson1.id, student_id: student_with_unsubmitted_levels.id}
    assert_response :ok
    response_data = JSON.parse(response.body)
    responses = response_data['cfu_responses']
    # Unsubmitted responses
    assert_equal false, responses[0]['submitted']
    assert_equal 'unsubmitted', responses[0]['response']['status']
    assert_equal false, responses[1]['submitted']
    assert_equal 'unsubmitted', responses[0]['response']['status']
    assert_equal false, responses[2]['submitted']
    assert_equal 'unsubmitted', responses[0]['response']['status']
  end

  test "cfu_responses endpoint tracks submitted status for LevelGroup CFUs" do
    multi_level_answers = [
      {"text" => "answer 1", "correct" => false},
      {"text" => "answer 2", "correct" => true},
    ]
    match_level_answers = [
      {"text" => "answer 1"},
      {"text" => "answer 2"},
      {"text" => "answer 3"}
    ]

    multi_cfu_sublevel = create(:level, name: 'Multi CFU Level', type: 'Multi',
      properties: {display_name: 'Multi CFU Display Name', questions: [{text: 'Multi question text'}], answers: multi_level_answers}
    )
    match_cfu_sublevel = create(:level, name: 'Match CFU Level', type: 'Match',
      properties: {display_name: 'Match CFU Display Name', content1: 'Match question text', answers: match_level_answers}
    )
    free_res_cfu_sublevel = create(:level, name: 'Free Response CFU Level', type: 'FreeResponse',
      properties: {display_name: 'Free Response CFU Display Name', long_instructions: 'Free Response question text', answers: nil}
    )
    level_group_dsl = <<~DSL
      name 'LevelGroupLevel1'
      title 'Level Group'
      anonymous 'true'

      page
      level 'Multi CFU Level'
      level 'Match CFU Level'
      level 'Free Response CFU Level'
    DSL
    level_group = LevelGroup.create_from_level_builder({}, {name: 'LevelGroupLevel1', dsl_text: level_group_dsl})
    create(:script_level, script: @unit, lesson: @lesson1, progression: 'Check Your Understanding', levels: [level_group], assessment: true)

    student_with_submitted_levels = create(:student)
    # Even if the LevelGroup has a 'submitted' value of 'false', if the student has submitted each sublevel the response will return 'submitted' as 'true'
    create(:user_level, user: student_with_submitted_levels, script: @unit, level: level_group, submitted: false)
    create(:user_level, user: student_with_submitted_levels, script: @unit, level: multi_cfu_sublevel, level_source: create(:level_source, data: '1'))
    create(:user_level, user: student_with_submitted_levels, script: @unit, level: match_cfu_sublevel, level_source: create(:level_source, data: '0,2,1'))
    create(:user_level, user: student_with_submitted_levels, script: @unit, level: free_res_cfu_sublevel, level_source: create(:level_source, data: 'Sample free response text'))

    student_with_unsubmitted_levels = create(:student)
    create(:user_level, user: student_with_unsubmitted_levels, script: @unit, level: level_group, submitted: false)
    create(:user_level, user: student_with_unsubmitted_levels, script: @unit, level: multi_cfu_sublevel, level_source: create(:level_source, data: '-1'))
    create(:user_level, user: student_with_unsubmitted_levels, script: @unit, level: match_cfu_sublevel, level_source: create(:level_source, data: ''))
    create(:user_level, user: student_with_unsubmitted_levels, script: @unit, level: free_res_cfu_sublevel, level_source: create(:level_source, data: ''))

    get :cfu_responses, params: {lesson_id: @lesson1.id, student_id: student_with_submitted_levels.id}
    assert_response :ok
    response_data = JSON.parse(response.body)
    student_response = response_data['cfu_responses'].first

    assert_equal true, student_response['submitted']

    get :cfu_responses, params: {lesson_id: @lesson1.id, student_id: student_with_unsubmitted_levels.id}
    assert_response :ok
    response_data = JSON.parse(response.body)
    student_response = response_data['cfu_responses'].first

    assert_equal false, student_response['submitted']
  end
end
