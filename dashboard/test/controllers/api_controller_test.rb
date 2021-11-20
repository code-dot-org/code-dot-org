require 'test_helper'

class ApiControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)

    @teacher_other = create(:teacher)

    @section = create(:section, user: @teacher, login_type: 'word')

    @script = create(:script, :with_levels, levels_count: 1)
    @script_level = @script.script_levels[0]
    @level = @script_level.level

    # some of our tests depend on sorting of students by name, thus we name them ourselves
    @students = []
    7.times do |i|
      student = create(:student, name: "student_#{i}")
      @students << student
      create(:follower, section: @section, student_user: student)
    end
    @student_1, @student_2, @student_3, @student_4, @student_5, @student_6, @student_7 = @students

    @flappy = create(:text_match, :with_script).script_levels.first.script
    @flappy_section = create(:section, user: @teacher, script_id: @flappy.id)
    @student_flappy_1 = create(:follower, section: @flappy_section).student_user
    @student_flappy_1.reload

    @allthings = create(:text_match, :with_script).script_levels.first.script
    @allthings_section = create(:section, user: @teacher, script_id: @allthings.id)
    @student_allthings = create(:student, name: 'student_allthings')
    create(:follower, section: @allthings_section, student_user: @student_allthings)
    @allthings_section.reload
    @student_allthings.reload
  end

  setup do
    sign_in @teacher
  end

  private def create_script_with_bonus_levels
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group

    regular_level = create :maze
    create :script_level, script: script, levels: [regular_level], lesson: lesson

    bonus_level = create :maze
    create :script_level, script: script, levels: [bonus_level], lesson: lesson, bonus: true

    [script, lesson, regular_level, bonus_level]
  end

  private def create_script_with_lockable_lesson
    script = create :script
    lesson_group = create :lesson_group, script: script

    # Create a LevelGroup level.
    level = create :level_group, :with_sublevels, name: 'LevelGroupLevel1'
    level.properties['title'] =  'Long assessment 1'
    level.properties['submittable'] = true
    level.save!

    lesson = create :lesson, name: 'Lesson1', script: script, lockable: true, lesson_group: lesson_group

    # Create a ScriptLevel joining this level to the script.
    create :script_level, script: script, levels: [level], assessment: true, lesson: lesson

    [script, level, lesson]
  end

  private def make_text_progress_in_script(script, student)
    level = script.script_levels.map(&:oldest_active_level).find {|l| l.is_a? TextMatch}
    level_source = create :level_source
    create :user_level, level: level, user: student, script: script, level_source: level_source
    # UserLevel.create!(level_id: level.id, user_id: student.id, script_id: script.id, level_source: level_source)
  end

  test "example_solutions should return expected example solutions" do
    STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    teacher = create :authorized_teacher
    sign_in teacher

    section = create :section
    level = create :dance, :with_example_solutions
    script_level = create :script_level, levels: [level]

    get :example_solutions, params: {script_level_id: script_level.id, level_id: level.id, section_id: section.id}

    assert_response :success
    assert_equal '["https://studio.code.org/projects/dance/example-1/view","https://studio.code.org/projects/dance/example-2/view"]', @response.body
  end

  test "example_solutions should return expected example solutions when section id is empty" do
    STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    teacher = create :authorized_teacher
    sign_in teacher

    level = create(:level, :blockly, :with_ideal_level_source)
    script_level = create :script_level, levels: [level]

    get :example_solutions, params: {script_level_id: script_level.id, level_id: level.id, section_id: ""}

    assert_response :success
    assert_equal "[\"http://test-studio.code.org/s/#{script_level.script.name}/lessons/1/levels/1?solution=true\"]", @response.body
  end

  test "example_solutions should return expected example solutions when section id is present" do
    STUB_ENCRYPTION_KEY = SecureRandom.base64(Encryption::KEY_LENGTH / 8)
    CDO.stubs(:properties_encryption_key).returns(STUB_ENCRYPTION_KEY)

    teacher = create :authorized_teacher
    sign_in teacher

    section = create :section
    level = create(:level, :blockly, :with_ideal_level_source)
    script_level = create :script_level, levels: [level]

    get :example_solutions, params: {script_level_id: script_level.id, level_id: level.id, section_id: section.id}

    assert_response :success
    assert_equal "[\"http://test-studio.code.org/s/#{script_level.script.name}/lessons/1/levels/1?section_id=#{section.id}\\u0026solution=true\"]", @response.body
  end

  test "should get text_responses for section with default script" do
    get :section_text_responses, params: {section_id: @section.id}
    assert_response :success

    # we fall back to twenty_hour_unit, which has no text_response levels
    assert_equal '[]', @response.body
  end

  test "should get text_responses for section with section script" do
    make_text_progress_in_script(@allthings_section.script, @student_allthings)

    get :section_text_responses, params: {section_id: @allthings_section.id}
    assert_response :success

    response = JSON.parse(@response.body)

    # make sure our response has lesson from the specified script
    assert /\/s\/#{@allthings.name}\// =~ response[0]['url']
  end

  test "should get text_responses for section with assigned course" do
    unit_group = create :unit_group
    create :unit_group_unit, unit_group: unit_group, script: @allthings, position: 1
    create :unit_group_unit, unit_group: unit_group, script: @flappy, position: 2
    unit_group.reload

    section = create(:section, user: @teacher, login_type: 'word', unit_group: unit_group)
    student = create(:student, name: 'student_in_course')
    create(:follower, section: section, student_user: student)
    section.reload
    student.reload

    make_text_progress_in_script(@allthings, student)

    get :section_text_responses, params: {section_id: section.id}
    assert_response :success

    response = JSON.parse(@response.body)

    # make sure our response has lesson from allthethings
    assert /\/s\/#{@allthings.name}\// =~ response[0]['url']
  end

  test "should get text_responses for section with specific script" do
    script = create(:text_match, :with_script).script_levels.first.script

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
    assert /\/s\/#{script.name}\// =~ response[0]['url']
  end

  test "should get text_responses for section with script with text response" do
    script = create :script, name: 'text-response-script'
    lesson_group = create :lesson_group, script: script
    lesson1 = create :lesson, script: script, name: 'First Lesson', key: 'First Lesson', lesson_group: lesson_group
    lesson2 = create :lesson, script: script, name: 'Second Lesson', key: 'Second Lesson', lesson_group: lesson_group

    # create 2 text_match levels
    level1 = create :text_match
    level1.properties['title'] = 'Text Match 1'
    level1.save!
    create :script_level, script: script, levels: [level1], lesson: lesson1

    level2 = create :text_match
    level2.properties['title'] = 'Text Match 2'
    level2.save!
    create :script_level, script: script, levels: [level2], lesson: lesson2
    # create some other random levels
    7.times do
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
        'lesson' => 'Lesson 1: First Lesson',
        'puzzle' => 1,
        'question' => 'Text Match 1',
        'response' => 'Here is the answer 1a',
        'url' => "http://test.host/s/#{script.name}/lessons/1/levels/1?section_id=#{@section.id}&user_id=#{@student_1.id}"
      },
      {
        'student' => {'id' => @student_1.id, 'name' => @student_1.name},
        'lesson' => 'Lesson 2: Second Lesson',
        'puzzle' => 1,
        'question' => 'Text Match 2',
        'response' => 'Here is the answer 1b',
        'url' => "http://test.host/s/#{script.name}/lessons/2/levels/1?section_id=#{@section.id}&user_id=#{@student_1.id}"
      },
      {
        'student' => {'id' => @student_2.id, 'name' => @student_2.name},
        'lesson' => 'Lesson 1: First Lesson',
        'puzzle' => 1,
        'question' => 'Text Match 1',
        'response' => 'Here is the answer 2',
        'url' => "http://test.host/s/#{script.name}/lessons/1/levels/1?section_id=#{@section.id}&user_id=#{@student_2.id}"
      }
    ]
    assert_equal expected_response, JSON.parse(@response.body)
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

  test "should get lock state when no user_level" do
    script, level, lesson = create_script_with_lockable_lesson

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
    assert_equal 1, section_response['lessons'].length

    lessons_response = section_response['lessons']
    assert_equal 1, lessons_response.keys.length, '1 lesson in our script'
    lesson_response = lessons_response[lesson.id.to_s]
    assert_equal 7, lesson_response.length, "entry for each student in section"

    @students.each_with_index do |student, index|
      student_response = lesson_response[index]
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
    assert_equal 1, flappy_section_response['lessons'][lesson.id.to_s].length
    assert_equal @student_flappy_1.name, flappy_section_response['lessons'][lesson.id.to_s][0]['name']
  end

  # Helper for setting up student lock tests
  def get_student_response(script, level, lesson, student_number)
    get :lockable_state, params: {section_id: @section.id, script_id: script.id}
    assert_response :success
    body = JSON.parse(response.body)

    student_responses = body[@section.id.to_s]['lessons'][lesson.id.to_s]
    if student_responses
      return student_responses[student_number - 1]
    else
      return nil
    end
  end

  test "student should show unlocked and not readonly" do
    # student_1 is unlocked
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_1, script: script, level: level, submitted: false, locked: false

    student_1_response = get_student_response(script, level, lesson, 1)

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
  end

  test "student was autolocked while in readonly state" do
    # student_1 is autolocked during readonly
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_1, script: script, level: level, submitted: true, readonly_answers: true

    student_1_response = get_student_response(script, level, lesson, 1)
    user_level_data = student_1_response['user_level_data']
    user_level = UserLevel.find_by(user_level_data)
    user_level.send(:unlocked_at=, 2.days.ago)
    assert_equal(
      {
        "user_id" => @student_1.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_1_response['user_level_data']
    )
    assert_equal true, user_level.locked
    assert_equal true, user_level.submitted
    assert_equal false, student_1_response['readonly_answers']
  end

  test "student should show unlocked and readonly" do
    # student_2 is unlocked and can view answers
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_2, script: script, level: level, submitted: true, locked: false, readonly_answers: true

    student_2_response = get_student_response(script, level, lesson, 2)
    assert_equal(
      {
        "user_id" => @student_2.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_2_response['user_level_data']
    )
    user_level_data = student_2_response['user_level_data']
    user_level = UserLevel.find_by(user_level_data)
    assert_equal false, user_level.locked
    assert_equal true, user_level.submitted
    assert_equal true, user_level.readonly_answers
  end

  test "student should show locked and not readonly" do
    # student_3 has a user level, but has submitted so is locked
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_3, script: script, level: level, submitted: true, readonly_answers: false

    student_3_response = get_student_response(script, level, lesson, 3)
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
    user_level_data = student_3_response['user_level_data']
    user_level = UserLevel.find_by(user_level_data)
    assert_equal true, user_level.submitted

    # Now, unlock the assessment again, confirm still submitted
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: false
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal false, user_level.locked
    assert_equal true, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
  end

  test "student has been autolocked" do
    # student_4 got autolocked while editing
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_4, script: script, level: level, submitted: false

    student_4_response = get_student_response(script, level, lesson, 4)
    user_level_data = student_4_response['user_level_data']
    user_level = UserLevel.find_by(user_level_data)
    user_level.send(:unlocked_at=, 2.days.ago)
    assert_equal(
      {
        "user_id" => @student_4.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_4_response['user_level_data']
    )
    assert_equal true, user_level.locked
    assert_equal false, student_4_response['readonly_answers']
    assert_equal false, user_level.submitted
  end

  test "readonly answers is overridden by lock value" do
    # student_5 is locked even though readonly is set as true
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_5, script: script, level: level, submitted: false, locked: true, readonly_answers: true

    student_5_response = get_student_response(script, level, lesson, 5)
    user_level_data = student_5_response['user_level_data']
    user_level = UserLevel.find_by(user_level_data)
    assert_equal(
      {
        "user_id" => @student_5.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_5_response['user_level_data']
    )

    assert_equal false, user_level.submitted?
    assert_equal true, user_level.locked

    # we only show as readonly_answers if we're not also locked, so the
    # response value is "false" even though the value in the db is "true"
    assert_equal true, user_level.readonly_answers?
    assert_equal false, student_5_response['readonly_answers']

    # Now, assessment is unlocked and readonly, but still not submitted
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: true
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal false, user_level.locked
    assert_equal false, user_level.submitted?
    assert_equal true, user_level.readonly_answers?

    # And finally, editable again
    updates = [
      {
        user_level_data: user_level_data,
        locked: false,
        readonly_answers: false
      }
    ]

    post :update_lockable_state, params: {updates: updates}
    user_level = UserLevel.find_by(user_level_data)
    assert_equal false, user_level.locked
    assert_equal false, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
  end

  test "student hasn't opened the assessment, assessment still locked" do
    # student_6 has never opened the assessment, assessment not yet unlocked
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_6, script: script, level: level, submitted: false

    student_6_response = get_student_response(script, level, lesson, 6)
    user_level_data = student_6_response['user_level_data']
    user_level = UserLevel.find_by(user_level_data)
    user_level.send(:unlocked_at=, nil)
    assert_equal(
      {
        "user_id" => @student_6.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_6_response['user_level_data']
    )
    assert_equal true, student_6_response['locked']
    assert_equal false, student_6_response['readonly_answers']
  end

  test "student never opened, though assessment was unlocked and has autolocked" do
    # student_7 has never opened the assessment
    script, level, lesson = create_script_with_lockable_lesson
    create :user_level, user: @student_7, script: script, level: level, submitted: false

    student_7_response = get_student_response(script, level, lesson, 7)
    user_level_data = student_7_response['user_level_data']
    user_level = UserLevel.find_by(user_level_data)
    user_level.send(:unlocked_at=, 2.days.ago)
    assert_equal(
      {
        "user_id" => @student_7.id,
        "level_id" => level.id,
        "script_id" => script.id
      },
      student_7_response['user_level_data']
    )
    assert_equal true, user_level.locked
    assert_equal false, student_7_response['readonly_answers']
    assert_equal false, user_level.submitted?

    # Now, unlock the assessment again to simulate a retake scenario
    user_level.really_destroy!
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
    assert_equal false, user_level.locked
    assert_equal false, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
  end

  test "should update lockable state for new user_levels" do
    script, level, _ = create_script_with_lockable_lesson

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
    assert_equal false, user_level.locked
    assert_equal false, user_level.submitted?
    assert_equal false, user_level.readonly_answers?
    assert_not_nil user_level.send(:unlocked_at)

    # view_anwers for a user_level that does not yet exist
    user_level.really_destroy!
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
    assert_equal false, user_level.submitted?
    assert_equal true, user_level.readonly_answers?
    assert_not_nil user_level.send(:unlocked_at)

    # multiple updates at once
    user_level.really_destroy!
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
    assert_equal false, user_level.locked
    assert_equal false, user_level.readonly_answers?
    assert_not_nil user_level.send(:unlocked_at)

    user_level2 = UserLevel.find_by(user_level_data2)
    assert_equal false, user_level2.submitted?
    assert_equal false, user_level2.locked
    assert_equal false, user_level2.readonly_answers?
    assert_not_nil user_level2.send(:unlocked_at)
  end

  test "should update lockable state for existing levels" do
    Timecop.freeze do
      script, level, _ = create_script_with_lockable_lesson

      user_level_data = {user_id: @student_1.id, level_id: level.id, script_id: script.id}
      user_level = create :user_level, user_level_data

      # update from editable to locked - does not auto-submit
      user_level.update!(submitted: false, readonly_answers: false)
      user_level.send(:unlocked_at=, Time.now)
      expected_updated_at = user_level.updated_at
      assert_equal false, user_level.locked
      Timecop.travel 1
      updates = [
        {
          user_level_data: user_level_data,
          locked: true,
          readonly_answers: false
        }
      ]

      post :update_lockable_state, params: {updates: updates}
      user_level = UserLevel.find_by(user_level_data)
      assert_equal false, user_level.submitted?
      assert_equal true, user_level.locked
      assert_equal false, user_level.readonly_answers?
      assert_nil user_level.send(:unlocked_at)
      # update_lockable_state does not modify updated_at
      assert_equal expected_updated_at, user_level.updated_at

      # update from editable to readonly_answers
      user_level.update!(submitted: false, readonly_answers: false)
      user_level.send(:unlocked_at=, Time.now)
      expected_updated_at = user_level.updated_at
      Timecop.travel 1
      updates = [
        {
          user_level_data: user_level_data,
          locked: false,
          readonly_answers: true
        }
      ]

      post :update_lockable_state, params: {updates: updates}
      user_level = UserLevel.find_by(user_level_data)
      assert_equal false, user_level.submitted?
      assert_equal false, user_level.locked
      assert_equal true, user_level.readonly_answers?
      assert_not_nil user_level.send(:unlocked_at)
      assert_equal expected_updated_at, user_level.updated_at

      # update from readonly_answers to locked
      user_level.update!(submitted: false, readonly_answers: true)
      user_level.send(:unlocked_at=, Time.now)
      expected_updated_at = user_level.updated_at
      Timecop.travel 1
      updates = [
        {
          user_level_data: user_level_data,
          locked: true,
          readonly_answers: false
        }
      ]

      post :update_lockable_state, params: {updates: updates}
      user_level = UserLevel.find_by(user_level_data)
      assert_equal false, user_level.submitted?
      assert_equal true, user_level.locked
      assert_equal false, user_level.readonly_answers?
      assert_nil user_level.send(:unlocked_at)
      assert_equal expected_updated_at, user_level.updated_at

      # update from readonly_answers to editable
      user_level.update!(submitted: false, readonly_answers: true)
      user_level.send(:unlocked_at=, Time.now)
      expected_updated_at = user_level.updated_at
      Timecop.travel 1
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
      assert_equal false, user_level.locked
      assert_equal false, user_level.readonly_answers?
      assert_not_nil user_level.send(:unlocked_at)
      assert_equal expected_updated_at, user_level.updated_at
    end
  end

  test "should fail to update lockable state if given bad data" do
    script, level, _ = create_script_with_lockable_lesson

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

  test "should get signed-in user's user progress" do
    user = create :user, total_lines: 2
    sign_in user

    create :user_level, user: user, best_result: 100, script: @script, level: @level

    get :user_progress, params: {script: @script.name}
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal true, body['signedIn']
    assert_equal 2, body['linesOfCode']
    level_progress = body['progress'][@level.id.to_s]
    refute_nil level_progress
    assert_equal 'perfect', level_progress['status']
    assert_equal 100, level_progress['result']
  end

  test "should get student's user progress if teacher of student" do
    sign_in @teacher

    create :user_level, user: @student_1, best_result: 100, script: @script, level: @level

    get :user_progress, params: {script: @script.name, user_id: @student_1.id}
    assert_response :success

    body = JSON.parse(response.body)
    level_progress = body['progress'][@level.id.to_s]
    refute_nil level_progress
    assert_equal 100, level_progress['result']
  end

  test "should not return student's user progress if not signed in" do
    sign_out @teacher

    create :user_level, user: @student_1, best_result: 100, script: @script, level: @level

    get :user_progress, params: {script: @script.name, user_id: @student_1.id}
    assert_response :success

    body = JSON.parse(response.body)
    assert_equal false, body['signedIn']
    assert_nil body['progress']
  end

  test "should fail to get student's user progress if not teacher of student" do
    user = create :user
    sign_in user

    create :user_level, user: @student_1, best_result: 100, script: @script, level: @level

    get :user_progress, params: {script: @script.name, user_id: @student_1.id}
    assert_response :forbidden
  end

  test "should get signed-in user's user app_options" do
    user = create :user, total_lines: 2
    sign_in user

    level_source = create :level_source, level: @level, data: 'level source'
    create :user_level, user: user, best_result: 100, script: @script,
      level: @level, level_source: level_source

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id
    }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal true, body['signedIn']
    assert_equal false, body['disableSocialShare']
    assert_equal 'level source', body['lastAttempt']['source']
  end

  test "should get student's user app_options if teacher of student" do
    sign_in @teacher

    level_source = create :level_source, level: @level, data: 'level source'
    create :user_level, user: @student_1, best_result: 100, script: @script,
      level: @level, level_source: level_source

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      user_id: @student_1.id
    }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal true, body['signedIn']
    assert_equal false, body['disableSocialShare']
    assert_equal 'level source', body['lastAttempt']['source']
    assert_equal true, body['isStarted']
  end

  test "should not return student's user app_options if not signed in" do
    sign_out @teacher

    level_source = create :level_source, level: @level, data: 'level source'
    create :user_level, user: @student_1, best_result: 100, script: @script,
      level: @level, level_source: level_source

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      user_id: @student_1.id
    }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal false, body['signedIn']
    assert_nil body['lastAttempt']
  end

  test "should fail to get student's user app_options if not teacher of student" do
    user = create :user
    sign_in user

    level_source = create :level_source, level: @level, data: 'level source'
    create :user_level, user: @student_1, best_result: 100, script: @script,
      level: @level, level_source: level_source

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      user_id: @student_1.id
    }
    assert_response :forbidden
  end

  test "user_app_options should not return readonly options when viewing self" do
    sign_in @student_1

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
    }

    assert_response :success
    body = JSON.parse(response.body)
    assert_nil body['skipInstructionsPopup']
    assert_nil body['readonlyWorkspace']
    assert_nil body['callouts']
  end

  test "user_app_options should return readonly options when viewing student" do
    sign_in @teacher

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      user_id: @student_1.id
    }

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal true, body['skipInstructionsPopup']
    assert_equal true, body['readonlyWorkspace']
    assert_equal [], body['callouts']
  end

  test "user_app_options should return existing channel if one exists" do
    sign_in @student_1

    channel_token = create :channel_token, level: @level, script_id: @script.id, storage_id: storage_id_for_user_id(@student_1.id)
    expected_channel = channel_token.channel

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      get_channel_id: true
    }

    body = JSON.parse(response.body)
    assert_equal expected_channel, body['channel']
  end

  test "user_app_options should create new channel if one doesn't exist" do
    sign_in @student_1

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      get_channel_id: true
    }

    body = JSON.parse(response.body)
    refute_nil body['channel']
  end

  test "user_app_options should not create channel when viewing student" do
    sign_in @teacher

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      get_channel_id: true,
      user_id: @student_1.id
    }

    body = JSON.parse(response.body)
    assert_nil body['channel']
  end

  test "user_app_options should create new channel if one doesn't exist when signed out" do
    sign_out @teacher

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      get_channel_id: true
    }

    body = JSON.parse(response.body)
    refute_nil body['channel']
  end

  test "user_app_options should not return channel when param get_channel_id is false" do
    user = @student_1
    sign_in user

    create :channel_token, level: @level, script_id: @script.id, storage_id: storage_id_for_user_id(user.id)

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      get_channel_id: false
    }

    body = JSON.parse(response.body)
    assert_nil body['channel']
    assert_nil body['reduceChannelUpdates']
  end

  test "user_app_options should normally return reduceChannelUpdates false" do
    sign_in @student_1

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      get_channel_id: true
    }

    body = JSON.parse(response.body)
    assert_equal false, body['reduceChannelUpdates']
  end

  test "user_app_options should return reduceChannelUpdates true in emergency mode" do
    sign_in @student_1

    # Mimic Gatekeeper setting that's set in emergency mode
    Gatekeeper.set('updateChannelOnSave', where: {script_name: @script.name}, value: false)

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id,
      get_channel_id: true
    }

    body = JSON.parse(response.body)
    assert_equal true, body['reduceChannelUpdates']
  end

  test "user_app_options should return disableSocialShare true for young student" do
    young_student = create :young_student
    sign_in young_student

    get :user_app_options, params: {
      script: @script.name,
      lesson_position: 1,
      level_position: 1,
      level: @level.id
    }
    assert_response :success
    body = JSON.parse(response.body)
    assert_equal true, body['disableSocialShare']
  end

  test "user_app_options should return previous attempt with swapped level" do
    sign_in @student_1
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    level1a = create :maze, name: 'maze 1'
    level1b = create :maze, name: 'maze 1 new'
    level_source = create :level_source, level: level1a, data: 'level source'
    create :script_level, script: script, lesson: lesson, levels: [level1a, level1b], properties: {'maze 1': {'active': false}}
    create :user_level, user: @student_1, script: script, level: level1a, level_source: level_source

    get :user_app_options, params: {
      script: script.name,
      lesson_position: 1,
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
        'id' => @flappy.id,
        'name' => I18n.t("data.script.name.#{@flappy.name}.title"),
        'levels_count' => 1,
        'lessons' => [{
          'length' => 1,
          'title' => @flappy.name
        }]
      },
      'students' => [{
        'id' => @student_flappy_1.id,
        'levels' => [['not_tried', 1, "/s/#{@flappy.name}/lessons/1/levels/1"]]
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

    get :section_progress, params: {section_id: @section.id, page: 3, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].length

    # fourth page has only one student (of 7 total)
    get :section_progress, params: {section_id: @section.id, page: 4, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['students'].length

    # if we request 1 per page, page 8 should still work (because page 7 gave
    # us a full page of data), but page 9 should fail
    get :section_progress, params: {section_id: @section.id, page: 8, per: 1}
    assert_response :success
    get :section_progress, params: {section_id: @section.id, page: 9, per: 1}
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

    get :section_progress, params: {section_id: @section.id, script_id: script.id, page: 3, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['students'].length

    # fourth page has only one student (of 7 total)
    get :section_progress, params: {section_id: @section.id, script_id: script.id, page: 4, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['students'].length
  end

  test "should get paginated section level progress" do
    get :section_level_progress, params: {section_id: @section.id, page: 1, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['student_progress'].keys.length
    assert_equal 4, data['pagination']['total_pages']

    get :section_level_progress, params: {section_id: @section.id, page: 2, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['student_progress'].keys.length

    get :section_level_progress, params: {section_id: @section.id, page: 3, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['student_progress'].keys.length

    # fourth page has only one student (of 7 total)
    get :section_level_progress, params: {section_id: @section.id, page: 4, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['student_progress'].keys.length

    # if we request 1 per page, page 8 should still work (because page 7 gave
    # us a full page of data), but page 9 should fail
    get :section_level_progress, params: {section_id: @section.id, page: 8, per: 1}
    assert_response :success
    get :section_level_progress, params: {section_id: @section.id, page: 9, per: 1}
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
    assert_equal 2, data['student_progress'].keys.length
    assert_equal 2, data['student_last_updates'].keys.length
    assert_equal 4, data['pagination']['total_pages']

    get :section_level_progress, params: {section_id: @section.id, script_id: script.id, page: 2, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 2, data['student_progress'].keys.length
    assert_equal 2, data['student_last_updates'].keys.length

    # fourth page has only one student (of 7 total)
    get :section_level_progress, params: {section_id: @section.id, script_id: script.id, page: 4, per: 2}
    assert_response :success
    data = JSON.parse(@response.body)
    assert_equal 1, data['student_progress'].keys.length
    assert_equal 1, data['student_last_updates'].keys.length
  end

  test "should get paired icons for paired user levels" do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    sl = create :script_level, lesson: lesson, script: script
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

    assert_equal @flappy.id, JSON.parse(@response.body)['script']['id']
  end

  test "should not return progress for bonus levels" do
    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    create :script_level, script: script, lesson: lesson
    create :script_level, script: script, lesson: lesson, bonus: true

    get :section_progress, params: {
      section_id: @flappy_section.id,
      script_id: script.id
    }

    assert_response :success

    response = JSON.parse(@response.body)
    assert_equal 1, response["students"][0]["levels"].length
    assert_equal 1, response["script"]["levels_count"]
    assert_equal 1, response["script"]["lessons"][0]["length"]
  end

  test "teacher_panel_progress returns progress when called with script and level" do
    script, _, regular_level, _ = create_script_with_bonus_levels

    # create progress for student_1 on regular_level
    create :user_level, user: @student_1, script: script, level: regular_level, best_result: ActivityConstants::BEST_PASS_RESULT
    create :user_level, user: @teacher, script: script, level: regular_level, best_result: ActivityConstants::MINIMUM_PASS_RESULT

    get :teacher_panel_progress, params: {
      section_id: @section.id,
      script_id: script.id,
      level_id: regular_level.id
    }

    assert_response :success

    response = JSON.parse(@response.body)

    # response is an array with one element for each student and one element for the teacher
    assert_equal @students.length + 1, response.length

    # teacher is the first result
    first_result = response[0]
    assert_equal @teacher.id, first_result["userId"]
    assert_equal regular_level.id.to_s, first_result["id"]
    assert_equal "passed", first_result["status"]

    # students are sorted by name so @student_1 should be the first result
    second_result = response[1]
    assert_equal @student_1.id, second_result["userId"]
    assert_equal regular_level.id.to_s, second_result["id"]
    assert_equal "perfect", second_result["status"]
  end

  test "teacher_panel_progress returns progress when called with lesson and is_bonus_lesson" do
    script, lesson, _, bonus_level = create_script_with_bonus_levels

    # create progress for student_1 on bonus_level
    create :user_level, user: @student_1, script: script, level: bonus_level, best_result: ActivityConstants::BEST_PASS_RESULT
    create :user_level, user: @teacher, script: script, level: bonus_level, best_result: ActivityConstants::MINIMUM_PASS_RESULT

    get :teacher_panel_progress, params: {
      section_id: @section.id,
      script_id: script.id,
      lesson_id: lesson.id,
      is_lesson_extras: true
    }

    assert_response :success

    response = JSON.parse(@response.body)

    # response is an array with one element for each student and one element for the teacher
    assert_equal @students.length + 1, response.length

    # teacher is the first result
    first_result = response[0]
    assert_equal @teacher.id, first_result["userId"]
    assert_equal bonus_level.id.to_s, first_result["id"]
    # if the user has done any work on a bonus level it's summarized as perfect for the teacher panel (not sure why)
    assert_equal "perfect", first_result["status"]

    # students are sorted by name so @student_1 should be the first result
    first_student = response[1]
    assert_equal @student_1.id, first_student["userId"]
    assert_equal bonus_level.id.to_s, first_student["id"]
    assert_equal "perfect", first_student["status"]
  end

  test "teacher_panel_progress returns error when called by teacher not associated with section" do
    sign_in @teacher_other

    get :teacher_panel_progress, params: {
      section_id: @section.id,
      script_id: @script.id
    }

    assert_response :forbidden
  end

  test "teacher_panel_section returns summarized section when passed section id owned by logged in teacher" do
    get :teacher_panel_section, params: {
      section_id: @section.id
    }

    assert_response :success
    response = JSON.parse(@response.body)

    assert_equal @section.id, response["id"]
    assert_equal @teacher.name, response["teacherName"]
    assert_equal 7, response["students"].length
  end

  test "teacher_panel_section returns no_content when passed section id not owned by logged in teacher" do
    teacher = create :teacher
    sign_in teacher

    get :teacher_panel_section, params: {
      section_id: @section.id
    }

    assert_response :no_content
  end

  test "teacher_panel_section returns teacher's section when no section id is passed and teacher has 1 section" do
    teacher = create :teacher
    sign_in teacher
    section = create(:section, user: teacher, login_type: 'word')

    get :teacher_panel_section

    assert_response :success
    response = JSON.parse(@response.body)

    assert_equal section.id, response["id"]
    assert_equal teacher.name, response["teacherName"]
    assert_equal 0, response["students"].length
  end

  test "teacher_panel_section returns no_content when no section_id is passed and teacher has multiple sections" do
    create(:section, user: @teacher, login_type: 'word')

    get :teacher_panel_section

    assert_response :no_content
  end

  test "teacher_panel_section returns no_content when teacher has no sections" do
    teacher = create :teacher
    sign_in teacher

    get :teacher_panel_section

    assert_response :no_content
  end

  test "teacher_panel_section returns no_content when no user is logged in" do
    get :teacher_panel_section

    assert_response :no_content
  end

  test "script_structure returns summarized script" do
    overview_path = 'http://script.overview/path'
    CDO.stubs(:studio_url).returns(overview_path)
    script = create(:script)

    user = create :user
    sign_in user

    get :script_structure, params: {script: script.id}
    assert_response :success
    response = JSON.parse(@response.body)
    expected_response = script.summarize(true, user, true).merge({path: overview_path}).with_indifferent_access
    assert_equal expected_response, response
  end

  test "script_structure returns summarized script with no user" do
    sign_out :user
    overview_path = 'http://script.overview/path'
    CDO.stubs(:studio_url).returns(overview_path)
    script = create(:script, :with_levels, levels_count: 5)

    get :script_structure, params: {script: script.id}
    assert_response :success
    response = JSON.parse(@response.body)
    expected_response = script.summarize(true, nil, true).merge({path: overview_path}).with_indifferent_access
    assert_equal expected_response, response
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

    # /api urls
    assert_recognizes(
      {controller: "api", action: "user_menu"},
      {method: "get", path: "/api/user_menu"}
    )

    assert_recognizes(
      {controller: "api", action: "section_progress", section_id: '2'},
      {method: "get", path: "/api/section_progress/2"}
    )
  end

  test 'clever_classrooms is Forbidden when not signed in' do
    sign_out :user
    get :clever_classrooms
    assert_response :forbidden
  end

  test 'clever_classrooms queries clever with user uid for unmigrated user' do
    teacher = create :teacher, :sso_provider, :demigrated, provider: AuthenticationOption::CLEVER
    sign_in teacher

    expected_uri = "https://api.clever.com/v2.1/teachers/#{teacher.uid}/sections"
    auth = {authorization: "Bearer #{teacher.oauth_token}"}
    mock_response = {data: []}.to_json
    RestClient.expects(:get).with(expected_uri, auth).returns(mock_response)
    get :clever_classrooms
  end

  test 'clever_classrooms queries clever with clever authentication_id for migrated user' do
    teacher = create :teacher, :with_clever_authentication_option
    auth_option = teacher.authentication_options.find_by(credential_type: AuthenticationOption::CLEVER)
    sign_in teacher
    assert_nil teacher.uid

    expected_uri = "https://api.clever.com/v2.1/teachers/#{auth_option.authentication_id}/sections"
    auth = {authorization: "Bearer #{auth_option.data_hash[:oauth_token]}"}
    mock_response = {data: []}.to_json
    RestClient.expects(:get).with(expected_uri, auth).returns(mock_response)
    get :clever_classrooms
  end

  test 'import_clever_classroom is Forbidden when not signed in' do
    sign_out :user
    get :import_clever_classroom
    assert_response :forbidden
  end

  test 'google_classrooms is Forbidden when not signed in' do
    sign_out :user
    get :google_classrooms
    assert_response :forbidden
  end

  test 'import_google_classroom is Forbidden when not signed in' do
    sign_out :user
    get :import_google_classroom
    assert_response :forbidden
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

  test 'sign_cookies' do
    skip 'TODO: stub secret key for CloudFront cookie signing'
    sign_out :user
    get :sign_cookies
    assert_response :success

    refute_nil @response.cookies['CloudFront-Key-Pair-Id']
    refute_nil @response.cookies['CloudFront-Signature']
    # indicates a custom policy
    refute_nil @response.cookies['CloudFront-Policy']
    # only used for canned policies
    assert_nil @response.cookies['CloudFront-Expires']

    assert_equal "max-age=3600, private", @response.headers["Cache-Control"]
  end
end
