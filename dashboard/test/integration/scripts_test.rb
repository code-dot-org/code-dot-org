require 'test_helper'

class ScriptsTest < ActionDispatch::IntegrationTest
  include LevelsHelper # for build_script_level_path

  setup do
    Rails.application.config.stubs(:levelbuilder_mode).returns true

    # stub writes so that we dont actually make updates to filesystem
    File.stubs(:write)

    @teacher = create :authorized_teacher
  end

  test 'authorized teacher viewing csp1-2020' do
    sign_in @teacher

    @unit = create :script, name: 'csp1-2020'
    @lesson_group = create :lesson_group, script: @unit
    @lockable_lesson = create(:lesson, script: @unit, name: 'Assessment Day', lockable: true, lesson_group: @lesson_group, has_lesson_plan: true, absolute_position: 15, relative_position: 14)
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@level_group], assessment: true)

    get build_script_level_path(@lockable_level_group_sl)
    assert_includes @response.body, '/s/csp1-2020/lessons/14/'
    follow_redirect!
    assert_response :success
    assert_select '.level-group', 1
    assert_select "#locked-lesson", 1
    assert_select "#locked-lesson[data-hidden]", 1
  end

  test 'authorized teacher viewing csp2-2020' do
    sign_in @teacher

    @unit = create :script, name: 'csp2-2020'
    @lesson_group = create :lesson_group, script: @unit
    @lockable_lesson = create(:lesson, script: @unit, name: 'Assessment Day', lockable: true, lesson_group: @lesson_group, has_lesson_plan: true, absolute_position: 9, relative_position: 9)
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@level_group], assessment: true)

    get build_script_level_path(@lockable_level_group_sl)
    assert_includes @response.body, '/s/csp2-2020/lessons/9/'
    follow_redirect!
    assert_response :success
    assert_select '.level-group', 1
    assert_select "#locked-lesson", 1
    assert_select "#locked-lesson[data-hidden]", 1
  end

  test 'assigned student can follow script family redirect' do
    unit = create(
      :script, name: 'coursez-2020', family_name: 'coursez', version_year: 'unversioned', is_course: true,
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta
    )
    CourseOffering.add_course_offering(unit)

    teacher = create :teacher
    section = create :section, teacher: teacher, script: unit
    student = create :student
    create :follower, section: section, student_user: student

    sign_in student

    get "/s/#{unit.family_name}"
    assert_response :redirect
    assert_match %r{/s/#{unit.name}$}, @response.headers['Location']
    follow_redirect!
    assert_response :success
  end

  test 'levelbuilder instrictions for csp2-2020' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))

    @unit = create :script, name: 'csp2-2020'
    @lesson_group = create :lesson_group, script: @unit
    @lockable_lesson = create(:lesson, script: @unit, name: 'Assessment Day', lockable: true, lesson_group: @lesson_group, has_lesson_plan: true, absolute_position: 9, relative_position: 9)
    @level_group = create(:level_group, :with_sublevels, name: 'assessment 1')
    @lockable_level_group_sl = create(:script_level, script: @unit, lesson: @lockable_lesson, levels: [@level_group], assessment: true)

    get "/s/#{@unit.name}/instructions"
    assert_response :success
    assert_select '.instructions_summary', 1
    assert_select '.instructions_summary h1', "CSP Unit 2 - The Internet ('20-'21)"
    assert_select ".script_level", 1
    assert_select '.script_level a[href="/s/csp2-2020/lessons/9/levels/1"]', 1
    assert_select ".script_level a", "Level 1: assessment 1"
  end

  test 'levelbuilder instructions for multiple lesson types' do
    Rails.application.config.stubs(:levelbuilder_mode).returns true
    sign_in(create(:levelbuilder))

    @unit = create :script, name: 'csp2-2020'
    lesson_group = create :lesson_group, script: @unit
    @lesson = create(
      :lesson,
      script_id: @unit.id,
      lesson_group: lesson_group,
      name: 'first lesson',
      relative_position: 1,
      absolute_position: 1,
      has_lesson_plan: true,
      properties: {
        overview: 'lesson overview',
        student_overview: 'student overview'
      }
    )
    @lesson2 = create(
      :lesson,
      script_id: @unit.id,
      lesson_group: lesson_group,
      name: 'second lesson',
      relative_position: 2,
      absolute_position: 2,
      has_lesson_plan: true
    )
    @level = create :maze
    @level2 = create(:level, long_instructions: 'foo', short_instructions: 'bar')
    @level3 = create :multi
    @script_level1 = create(
      :script_level,
      activity_section: @activity_section,
      activity_section_position: 1,
      chapter: 1,
      position: 1,
      lesson: @lesson,
      script: @lesson.script,
      levels: [@level],
      challenge: true
    )
    @script_level2 = create(
      :script_level,
      activity_section: @activity_section,
      activity_section_position: 1,
      chapter: 1,
      position: 2,
      lesson: @lesson,
      script: @lesson.script,
      levels: [@level2],
      challenge: true
    )
    @script_level3 = create(
      :script_level,
      activity_section: @activity_section,
      activity_section_position: 1,
      chapter: 1,
      position: 1,
      lesson: @lesson2,
      script: @lesson2.script,
      levels: [@level3],
      challenge: true
    )

    get "/s/#{@unit.name}/instructions"
    assert_response :success
    assert_select '.instructions_summary', 1
    assert_select '.instructions_summary h1', 2
    assert_select '.instructions_summary h1', "Lesson 1: first lesson"
    assert_select '.instructions_summary h1', "Lesson 2: second lesson"
    assert_select ".script_level", 3
    assert_select ".script_level div", "type: Maze"
    assert_select ".script_level div", /Questions:.*/
  end
end
