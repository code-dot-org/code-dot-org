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
    put :update, params: {section_id: @section.id, id: @student.id, student: {gender: 'f', age: 9, name: 'testname'}}
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
    put :update, params: {section_id: @section.id, id: @student.id, student: {username: 'newname'}}
    assert_response :success
    assert_equal current_username, JSON.parse(@response.body)['username']
  end

  test 'teacher can not update invalid info for their student' do
    sign_in @teacher
    User.any_instance.stubs(:update).returns(false)
    put :update, params: {section_id: @section.id, id: @student.id, student: {gender: 'd'}}
    assert_response :bad_request
  end

  test 'non-owner can not update student info' do
    sign_in @other_teacher
    put :update, params: {section_id: @section.id, id: @student.id, student: {gender: 'f'}}
    assert_response :forbidden
  end

  test 'teacher can add one student to a word section' do
    sign_in @teacher
    post :bulk_add, params: {section_id: @section.id, students: [{gender: 'f', age: 9, name: 'name'}]}
    assert_response :success

    parsed_response = JSON.parse(@response.body)
    assert_equal 'name', parsed_response[0]['name']
    assert_equal 9, parsed_response[0]['age']
    assert_equal 'f', parsed_response[0]['gender']

    new_student = User.find_by_id(parsed_response[0]['id'])

    assert_equal 'name', new_student.name
    assert_equal 9, new_student.age
    assert_equal 'f', new_student.gender
  end

  test 'teacher can add multiple student to a word section' do
    sign_in @teacher
    post :bulk_add, params: {section_id: @section.id,
      students: [{gender: 'f', age: 10, name: 'name1'}, {gender: 'm', age: 10, name: 'name2'}]}
    assert_response :success
    assert_equal 2, JSON.parse(@response.body).length
  end

  test 'non-owner can not add student' do
    sign_in @other_teacher
    post :bulk_add, params: {section_id: @section.id, students: [{gender: 'f', age: 9, name: 'name'}]}
    assert_response :forbidden
  end

  test 'email section cannot add students' do
    sign_in @teacher
    @section = create(:section, user: @teacher, login_type: 'email')
    post :bulk_add, params: {section_id: @section.id, students: [{gender: 'f', age: 9, name: 'name'}]}
    assert_response :bad_request
  end

  test 'teacher can not add invalid info for their student' do
    sign_in @teacher
    User.stubs(:create!).raises(ActiveRecord::RecordInvalid)
    post :bulk_add, params: {section_id: @section.id, students: [{gender: 'm', age: 9, name: 'name'}]}
    assert_response :bad_request
  end
end
