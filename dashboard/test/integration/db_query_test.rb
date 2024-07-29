require 'test_helper'

# Prevent regressions in the number of database queries on high-traffic routes.
class DBQueryTest < ActionDispatch::IntegrationTest
  setup_all do
    seed_deprecated_unit_fixtures
  end

  def setup
    setup_script_cache
  end

  test "script level show" do
    student = create :student
    sign_in student

    script = Unit.get_from_cache('allthethings')
    lesson = script.lessons.first
    level = lesson.script_levels.first.levels.first

    create :user_level,
      user: student,
      script: script,
      level: level,
      level_source: create(:level_source, level: level)

    assert_cached_queries(11) do
      get script_lesson_script_level_path(
        script_id: script.name,
        lesson_position: 1,
        id: 1
      )
      assert_response :success
    end
  end

  test "user progress" do
    student = create :student
    sign_in student

    script = Unit.hoc_2014_unit
    lesson = script.lessons.first
    level = lesson.script_levels.first.levels.first

    create :user_level,
      user: student,
      script: script,
      level: level,
      level_source: create(:level_source, level: level)

    user_app_options_path = user_app_options_path(
      script: script.name,
      lesson_position: 1,
      level_position: 1,
      level: level.id
    )

    assert_cached_queries(4) do
      get user_app_options_path,
        headers: {HTTP_USER_AGENT: 'test'}
      assert_response :success
    end
  end

  test "post milestone passing last level of progression" do
    student = create :student
    sign_in student

    sl = create(:script, :with_levels, levels_count: 3).script_levels[2]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    setup_script_cache
    assert_cached_queries(11) do
      post milestone_path(
        user_id: student.id,
        script_level_id: sl.id
      ), params: params
      assert_response :success
    end
  end

  test "post milestone passing middle level of progression" do
    student = create :student
    sign_in student

    sl = create(:script, :with_levels, levels_count: 3).script_levels[1]
    params = {program: 'fake program', testResult: 100, result: 'true'}

    setup_script_cache
    assert_cached_queries(9) do
      post milestone_path(
        user_id: student.id,
        script_level_id: sl.id
      ), params: params
      assert_response :success
    end
  end

  test "post milestone not passing" do
    student = create :student
    sign_in student

    sl = create(:script, :with_levels, levels_count: 3).script_levels[2]
    params = {program: 'fake program', testResult: 0, result: 'false'}

    assert_cached_queries(9) do
      post milestone_path(
        user_id: student.id,
        script_level_id: sl.id
      ), params: params
      assert_response :success
    end
  end

  test "student in section views uncached hoc unit" do
    script = create(
      :script,
      :with_levels,
      levels_count: 10,
      is_course: true,
      family_name: 'hoc-family',
      version_year: 'unversioned',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    )
    CourseOffering.add_course_offering(script)

    teacher = create :teacher
    section = create :section, user: teacher
    student = create :student
    section.students = [student]
    student.assign_script(script)
    sign_in student

    assert_cached_queries(7) do
      get "/s/#{script.name}"
      assert_response :success
    end

    # Simulate all the ajax requests which the unit overview page sends to the
    # server on page load.

    assert_cached_queries(6) do
      get "/api/user_progress/#{script.name}"
      assert_response :success
    end

    assert_cached_queries(4) do
      get "/api/v1/teacher_feedbacks/count?student_id=#{student.id}"
      assert_response :success
    end
  end

  test "student in section views uncached hoc level" do
    unit = create(
      :script,
      :with_levels,
      levels_count: 10,
      is_course: true,
      family_name: 'hoc-family',
      version_year: 'unversioned',
      published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.stable
    )
    CourseOffering.add_course_offering(unit)

    # make sure the new unit is in the cache
    setup_script_cache

    level = unit.levels.first

    teacher = create :teacher
    section = create :section, user: teacher, script: unit
    student = create :student
    section.students = [student]
    student.assign_script(unit)
    sign_in student

    assert_cached_queries(20) do
      get "/s/#{unit.name}/lessons/1/levels/1"
      assert_response :success
    end

    # Simulate all the ajax requests which the level page sends to the
    # server on page load.

    assert_cached_queries(2) do
      get "/api/user_app_options/#{unit.name}/1/1/#{level.id}"
      assert_response :success
    end

    assert_cached_queries(4) do
      get "/levels/#{level.id}/get_rubric"
      assert_response :success
    end
  end
end
