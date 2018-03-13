require 'test_helper'

class Api::V1::SectionsStudentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @other_teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
  end

  test 'logged out cannot view section students' do
    get :index, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'student cannot view section students' do
    sign_in @student
    get :index, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'non-owner cannot view section students' do
    sign_in @other_teacher
    get :index, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'lists students' do
    sign_in @teacher

    get :index, params: {section_id: @section.id}
    assert_response :success
    expected_summary = [
      @student.summarize.merge(completed_levels_count: @student.user_levels.passing.count)
    ].to_json
    assert_equal expected_summary, @response.body
  end

  test 'teacher can update gender, name and age info for their student' do
    sign_in @teacher
    put :update, params: {section_id: @section.id, id: @student.id, gender: 'f', age: 9, name: 'testname'}
    assert_response :success
    assert_equal 'f', JSON.parse(@response.body)['gender']
    assert_equal 9, JSON.parse(@response.body)['age']
    assert_equal 'testname', JSON.parse(@response.body)['name']

    assert_equal 'testname', @student.reload.name
    assert_equal 9, @student.age
    assert_equal 'f', @student.gender
  end

  test 'teacher can not update username info for their student' do
    sign_in @teacher
    current_username = @student.username
    put :update, params: {section_id: @section.id, id: @student.id, username: 'newname'}
    assert_response :success
    assert_equal current_username, JSON.parse(@response.body)['username']
  end

  test 'non-owner can not update student info' do
    sign_in @other_teacher
    put :update, params: {section_id: @section.id, id: @student.id, gender: 'f'}
    assert_response :forbidden
  end
end
