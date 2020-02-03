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
      @student.summarize.merge(depends_on_this_section_for_login: false)
    ].to_json
    assert_equal expected_summary, @response.body
  end

  test "depends_on_this_section_for_login if this is sponsored student's only section" do
    student = create :student_in_picture_section
    assert student.teacher_managed_account?
    assert_equal 1, student.sections_as_student.size

    sign_in student.teachers.first
    get :index, params: {section_id: student.sections_as_student.first.id}
    assert_response :success

    response = JSON.parse @response.body
    assert response[0]['depends_on_this_section_for_login']
  end

  test "not depends_on_this_section_for_login if sponsored student has multiple sections" do
    student = create :student_in_picture_section
    second_section = create :section, login_type: Section::LOGIN_TYPE_PICTURE
    create :follower, student_user: student, section: second_section
    student.reload

    assert student.teacher_managed_account?
    assert_equal 2, student.sections_as_student.size

    sign_in student.teachers.first
    get :index, params: {section_id: student.sections_as_student.first.id}
    assert_response :success

    response = JSON.parse @response.body
    refute response[0]['depends_on_this_section_for_login']
  end

  test "not depends_on_this_section_for_login if student is parent-managed" do
    student = create :parent_managed_student, :in_picture_section

    refute student.teacher_managed_account?
    assert_equal 1, student.sections_as_student.size

    sign_in student.teachers.first
    get :index, params: {section_id: student.sections_as_student.first.id}
    assert_response :success

    response = JSON.parse @response.body
    refute response[0]['depends_on_this_section_for_login']
  end

  test "not depends_on_this_section_for_login if student is in an email section" do
    student = create :student, :in_email_section

    refute student.teacher_managed_account?
    assert_equal 1, student.sections_as_student.size

    sign_in student.teachers.first
    get :index, params: {section_id: student.sections_as_student.first.id}
    assert_response :success

    response = JSON.parse @response.body
    refute response[0]['depends_on_this_section_for_login']
  end

  test 'calculates completed levels count for each new student' do
    sign_in @teacher

    get :completed_levels_count, params: {section_id: @section.id}
    assert_response :success
    expected_level_count = {
      @student.id => 0
    }.to_json
    assert_equal expected_level_count, @response.body
  end

  test 'accurately calculates completed levels count for each student' do
    sign_in @teacher

    @level = create(:level)
    UserLevel.create(
      user: @student,
      level: @level,
      attempts: 1,
      best_result: 100
    )
    completed_levels_count = UserLevel.where(user_id: @student.id, best_result: 100).length

    get :completed_levels_count, params: {section_id: @section.id}
    assert_response :success
    expected_level_count = {
      @student.id => completed_levels_count
    }.to_json
    assert_equal expected_level_count, @response.body
  end

  test 'teacher cannot update another teacher' do
    other_teacher = create(:teacher)
    @section.students << other_teacher

    sign_in @teacher
    put :update, params: {section_id: @section.id, id: other_teacher.id, student: {age: 10}}

    assert_response :forbidden
  end

  test 'teacher can update gender, name, age, and password info for their student' do
    sign_in @teacher
    put :update, params: {section_id: @section.id, id: @student.id, student: {gender: 'f', age: 9, name: 'testname', password: 'testpassword'}}
    assert_response :success
    assert_equal 'f', JSON.parse(@response.body)['gender']
    assert_equal 9, JSON.parse(@response.body)['age']
    assert_equal 'testname', JSON.parse(@response.body)['name']

    assert_equal 'testname', @student.reload.name
    assert_equal 9, @student.age
    assert_equal 'f', @student.gender
    assert @student.valid_password?('testpassword')
  end

  test 'teacher can reset secret picture and words for their student' do
    sign_in @teacher
    @student.reload
    old_secret_picture_path = @student.secret_picture.path
    old_secret_words = @student.secret_words
    params = {section_id: @section.id, id: @student.id, student: {name: 'testname'}, secrets: User::RESET_SECRETS}

    put :update, params: params
    response = JSON.parse(@response.body)

    @student.reload
    assert response['secret_picture_path'].present?
    assert response['secret_words'].present?
    refute_equal response['secret_picture_path'], old_secret_picture_path
    refute_equal response['secret_words'], old_secret_words
    assert_equal response['secret_picture_path'], @student.secret_picture.path
    assert_equal response['secret_words'], @student.secret_words
  end

  test 'teacher only resets secret picture and words for their student if requested' do
    sign_in @teacher
    @student.reload
    secret_picture_path = @student.secret_picture.path
    secret_words = @student.secret_words
    params = {section_id: @section.id, id: @student.id, student: {name: 'testname'}, secrets: 'do-not-reset'}

    put :update, params: params
    response = JSON.parse(@response.body)

    @student.reload
    assert response['secret_picture_path'].present?
    assert response['secret_words'].present?
    assert_equal response['secret_picture_path'], secret_picture_path
    assert_equal response['secret_words'], secret_words
    assert_equal secret_picture_path, @student.secret_picture.path
    assert_equal secret_words, @student.secret_words
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

  test 'teacher can not update info for a non-existant student' do
    sign_in @teacher
    put :update, params: {section_id: @section.id, id: 'not a user', student: {name: 'newname'}}
    assert_response :forbidden
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
    assert_difference 'User.count', 2 do
      post :bulk_add, params: {section_id: @section.id,
        students: [{gender: 'f', age: 10, name: 'name1'}, {gender: 'm', age: 10, name: 'name2'}]}
    end
    assert_response :success
    assert_equal 2, JSON.parse(@response.body).length
  end

  test 'non-owner can not add student' do
    sign_in @other_teacher
    assert_does_not_create User do
      post :bulk_add, params: {section_id: @section.id, students: [{gender: 'f', age: 9, name: 'name'}]}
    end
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

  test 'teacher can remove a student from their section' do
    sign_in @teacher
    student_to_remove = User.create!(
      user_type: User::TYPE_STUDENT,
      provider: User::PROVIDER_SPONSORED,
      name: "student_to_delete",
      age: 9,
      gender: 'm'
    )
    @section.add_student(student_to_remove)
    num_students = @section.students.length
    post :remove, params: {section_id: @section.id, id: student_to_remove.id}
    assert_response :success
    assert_equal num_students - 1, @section.reload.students.length
  end

  test 'non-owner can not remove student' do
    sign_in @other_teacher
    post :remove, params: {section_id: @section.id, id: @student.id}
    assert_response :forbidden
  end
end
