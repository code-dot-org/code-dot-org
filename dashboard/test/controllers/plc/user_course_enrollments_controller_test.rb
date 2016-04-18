require 'test_helper'

class Plc::UserCourseEnrollmentsControllerTest < ActionController::TestCase
  setup do
    @user = create :admin
    sign_in(@user)
    @plc_course = create :plc_course
    @user_course_enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: @plc_course)
    @district_contact = create :district_contact
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create plc_user_course_enrollment" do
    @user_course_enrollment.destroy

    assert_creates(Plc::UserCourseEnrollment) do
      post :create, user_email: @user.email, plc_course_id: @plc_course.id
    end

    assert_redirected_to plc_user_course_enrollments_path

    assert_no_difference('Plc::UserCourseEnrollment.count') do
      post :create, user_email: @user.email, plc_course_id: @plc_course.id
    end

    assert_redirected_to plc_user_course_enrollments_path
  end

  test 'Admins can access course and group view and manager view' do
    get :index
    assert_response :success
    get :group_view
    assert_response :success
    get :manager_view, id: @user_course_enrollment
    assert_response :success
  end

  test 'Teachers can view dashboard but not group view' do
    sign_out @user
    teacher = create :teacher

    sign_in(teacher)
    get :index
    assert_response :success
    get :group_view
    assert_response :forbidden
    get :manager_view, id: @user_course_enrollment
    assert_response :forbidden
  end

  test 'Students cannot access course view nor group view' do
    sign_out @user
    student = create :student

    sign_in(student)
    get :index
    assert_response :forbidden
    get :group_view
    assert_response :forbidden
    get :manager_view, id: @user_course_enrollment
    assert_response :forbidden
  end

  test 'District managers can only view teachers they manage' do
    district = create(:district, contact: @district_contact)
    teacher1 = create(:teacher, name: 'Teacher 1')
    create(:districts_users, user: teacher1, district: district)
    teacher2 = create(:teacher, name: 'Teacher 2')
    create(:districts_users, user: teacher2, district: district)
    teacher3 = create(:teacher, name: 'Teacher 3')

    [teacher1, teacher2, teacher3].each do |teacher|
      create(:plc_user_course_enrollment, user: teacher, plc_course: @plc_course)
    end

    sign_out @user
    sign_in @district_contact
    get :index
    assert_response :success
    get :group_view
    assert_response :success
    assert_select 'table tbody tr', 2
    get :manager_view, id: teacher1.plc_enrollments.first
    assert_response :success
  end

  test 'District managers cannot view teachers they do not manage' do
    sign_out @user
    sign_in @district_contact

    get :manager_view, id: @user_course_enrollment
    assert_response :forbidden
  end

  test 'Signed out users get redirected to sign in' do
    sign_out @user
    assert_signed_in_as nil

    get :index
    assert_redirected_to_sign_in
  end
end
