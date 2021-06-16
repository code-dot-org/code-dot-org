require 'test_helper'

class Api::V1::TeacherScoresControllerTest < ActionDispatch::IntegrationTest
  self.use_transactional_test_case = true
  setup_all do
    @teacher = create :teacher
    @student = create :student
    @section = create :section, user: @teacher
    @lesson = create :lesson
    @lesson_2 = create :lesson
    @unit = create :script
  end

  test 'score_lesson_for_section is forbidden if signed out' do
    post '/dashboardapi/v1/teacher_scores', params: {
      section_id: @section.id, lesson_scores: [{lesson_id: @lesson.id, score: 100}]
    }
    assert_response 302
  end

  test 'score_lesson_for_section is forbidden if student' do
    sign_in @student
    post '/dashboardapi/v1/teacher_scores', params: {
      section_id: @section.id, lesson_scores: [{lesson_id: @lesson.id, score: 100}]
    }
    assert_response :forbidden
  end

  test 'score_lesson_for_section is forbidden for teacher who does not own section' do
    sign_in @teacher
    section_2 = create :section
    post '/dashboardapi/v1/teacher_scores', params: {section_id: section_2.id, lesson_scores: [{lesson_id: @lesson.id, score: 100}]}
    assert_response :forbidden
  end

  test 'score_lessons_for_section succeeds with only one lesson' do
    teacher = create :teacher
    section = create :section, teacher: teacher
    section.students << create(:student)
    sign_in teacher

    script = create :script
    script_level = create(
      :script_level,
      script: script,
      levels: [
        create(:maze, name: 'test level 1')
      ]
    )
    lesson = script_level.lesson

    sign_in teacher
    post '/dashboardapi/v1/teacher_scores', params: {section_id: section.id, lesson_scores: [{lesson_id: lesson.id, score: 100}]}
    assert TeacherScore.where(teacher_id: teacher.id).exists?
    assert_response :no_content
  end

  test 'score_lessons_for_section fails if lesson is not found' do
    teacher = create :teacher
    section = create :section, teacher: teacher
    section.students << create(:student)
    sign_in teacher

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    create(
      :script_level,
      script: script,
      lesson: lesson,
      levels: [
        create(:maze, name: 'test level 1')
      ]
    )
    destroyed_lesson = create :lesson
    destroyed_lesson.destroy
    post '/dashboardapi/v1/teacher_scores', params: {section_id: section.id, lesson_scores: [{lesson_id: lesson.id, score: 100}, {lesson_id: destroyed_lesson.id, score: 0}]}
    refute TeacherScore.where(teacher_id: teacher.id).exists?
    assert_response :forbidden
  end

  test 'get_teacher_scores_for_script is restricted if signed out' do
    get "/dashboardapi/v1/teacher_scores/#{@section.id}/#{@unit.id}"
    assert_response :unauthorized
  end

  test 'get_teacher_scores_for_script is restricted if student' do
    sign_in @student
    get "/dashboardapi/v1/teacher_scores/#{@section.id}/#{@unit.id}"
    assert_response :forbidden
  end

  test 'get_teacher_scores_for_script succeeds for teacher' do
    teacher = create :teacher
    section = create :section, teacher: teacher
    student = create :student
    section.students << student
    sign_in teacher

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group, unplugged: true
    script_level = create(
      :script_level,
      script: script,
      lesson: lesson,
      levels: [
        create(:unplugged, name: 'test level 1')
      ]
    )
    level = script_level.levels[0]
    score = 100

    post '/dashboardapi/v1/teacher_scores', params: {section_id: section.id, lesson_scores: [{lesson_id: lesson.id, score: score}]}

    get "/dashboardapi/v1/teacher_scores/#{section.id}/#{script.id}"

    assert_equal formatted_response, "{#{script.id}:{#{lesson.id}:{#{student.id}:{#{level.id}:#{score}}}}}"
  end

  test 'get_teacher_scores_for_script query count' do
    teacher = create :teacher
    section = create :section, teacher: teacher
    10.times do
      student = create :student
      section.students << student
    end
    sign_in teacher

    script = create :script
    lesson_group = create :lesson_group, script: script
    lesson = create :lesson, script: script, lesson_group: lesson_group
    script_level = create(
      :script_level,
      script: script,
      lesson: lesson,
      levels: [
        create(:unplugged, name: 'test level 1')
      ]
    )
    level = script_level.levels[0]
    score = 100

    section.students.each do |student|
      create :user_level, user: student, level: level, script: script
    end

    post '/dashboardapi/v1/teacher_scores', params: {section_id: section.id, lesson_scores: [{lesson_id: lesson.id, score: score}]}

    assert_queries 6 do
      get "/dashboardapi/v1/teacher_scores/#{section.id}/#{script.id}"
    end

    assert_equal section.students.count, 10

    student = create :student
    section.students << student
    create :user_level, user: student, level: level, script: script

    assert_equal section.students.count, 11

    assert_queries 6 do
      get "/dashboardapi/v1/teacher_scores/#{section.id}/#{script.id}"
    end
  end

  private

  def formatted_response
    @response.body.delete!('\\"')
  end
end
