require 'test_helper'

class StageLockTest < ActionDispatch::IntegrationTest
  setup_all do
    @student = create :student
    @teacher = create :teacher
    @section = create :section, user_id: @teacher.id
    Follower.create!(section_id: @section.id, student_user_id: @student.id, user: @teacher)

    @teacher_of_teachers = create :teacher
    @section_of_teachers = create :section, user_id: @teacher_of_teachers.id
    Follower.create!(section_id: @section_of_teachers.id, student_user_id: @teacher.id, user: @teacher_of_teachers)
  end

  test 'student homepage does not contain secret words' do
    sign_in @student
    get '/home'
    assert_select 'script[data-homepage]' do |elements|
      data = elements.first['data-homepage']
      assert_includes data, 'numberOfStudents'
      refute_includes data, 'secret_words'
    end
  end

  test 'teacher homepage does not contain secret words' do
    sign_in @teacher
    get '/home'
    assert_select 'script[data-homepage]' do |elements|
      data = elements.first['data-homepage']
      assert_includes data, 'numberOfStudents'
      refute_includes data, 'secret_words'
    end
  end
end
