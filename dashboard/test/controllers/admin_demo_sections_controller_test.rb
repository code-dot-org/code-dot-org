require 'test_helper'

class AdminDemoSectionsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @admin = create(:admin)
    sign_in(@admin)
  end

  test 'index is accessible by teachers' do
    teacher = create(:teacher)
    sign_in(teacher)
    get :index
    assert_response :success
  end

  test 'index is not accessible by students' do
    student = create(:student)
    sign_in(student)
    get :index
    assert_response :forbidden
  end

  test 'create is not accessible by teachers' do
    teacher = create(:teacher)
    sign_in(teacher)
    post :create, params: {
      demo_type: 'teacher_test',
      section_name: 'Demo Section',
      login_type: Section::LOGIN_TYPE_WORD,
      grades: ['K'],
      unit_name: '',
      unit_group_name: '',
      demo_student_ids: [],
    }
    assert_response :forbidden
  end

  test 'destroy is not accessible by teachers' do
    da = DemoAssignment.create!(
      demo_type: 'destroy_test',
      section_name: 'Demo Section',
      login_type: Section::LOGIN_TYPE_WORD,
      participant_type: 'student',
      grades: ['K'],
      unit_name: '',
      unit_group_name: '',
      demo_student_ids: [],
    )
    teacher = create(:teacher)
    sign_in(teacher)
    delete :destroy, params: {id: da.id}
    assert_response :forbidden
  end

  test 'lookup_users is accessible by teachers' do
    teacher = create(:teacher)
    sign_in(teacher)
    get :lookup_users, params: {ids: ''}
    assert_response :success
  end

  test 'create rejects LTI students' do
    lti_student = create(:student, :with_lti_auth)

    post :create, params: {
      demo_type: 'test_lti',
      section_name: 'Demo Section',
      login_type: Section::LOGIN_TYPE_WORD,
      grades: ['K'],
      unit_name: '',
      unit_group_name: '',
      demo_student_ids: [lti_student.id],
    }

    assert_response :bad_request
    assert_equal 'Demo sections cannot include LTI students', JSON.parse(@response.body)['error']
  end

  test 'create succeeds with non-LTI students' do
    student = create(:student)

    post :create, params: {
      demo_type: 'test_non_lti',
      section_name: 'Demo Section',
      login_type: Section::LOGIN_TYPE_WORD,
      grades: ['K'],
      unit_name: '',
      unit_group_name: '',
      demo_student_ids: [student.id],
    }

    assert_response :success
  end

  test 'create clears credentials on demo students' do
    student = create(:student, password: 'password1')

    refute_empty student.encrypted_password
    assert student.authentication_options.count > 0

    post :create, params: {
      demo_type: 'test_creds',
      section_name: 'Demo Section',
      login_type: Section::LOGIN_TYPE_WORD,
      grades: ['K'],
      unit_name: '',
      unit_group_name: '',
      demo_student_ids: [student.id],
    }

    assert_response :success
    student.reload
    assert_empty student.encrypted_password
    assert_equal 0, student.authentication_options.count
  end
end
