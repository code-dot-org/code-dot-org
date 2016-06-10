require 'test_helper'

class Plc::UserCourseEnrollmentsControllerTest < ActionController::TestCase
  setup do
    @user = create :admin_teacher
    sign_in(@user)
    @plc_course = create(:plc_course, name: 'Test Course')
    @user_course_enrollment = create(:plc_user_course_enrollment, user: @user, plc_course: @plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @plc_course)
    @enrollment_unit_assignment = create(:plc_enrollment_unit_assignment, plc_course_unit: @course_unit, plc_user_course_enrollment: @user_course_enrollment, user: @user)
    @district_contact = create :district_contact
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test 'invalid email address' do
    post :create, user_emails: 'invalid', plc_course_id: @plc_course.id
    assert_redirected_to action: :new, notice: 'Unknown users invalid'

    post :create, user_emails: "invalid\r\n#{@user.email}"
    assert_redirected_to action: :new, notice: 'Unknown users invalid'
  end

  test 'validation failed' do
    assert_raise do
      post :create, user_emails: @user.email, plc_course_id: nil
    end
  end

  test "should create plc_user_course_enrollment" do
    @user_course_enrollment.destroy

    assert_creates(Plc::UserCourseEnrollment) do
      post :create, user_emails: @user.email, plc_course_id: @plc_course.id
    end

    assert_redirected_to action: :new, notice: "Enrollments created for #{@user.email}"

    user2 = create :teacher
    user3 = create :teacher

    post :create, user_emails: "#{user2.email}\r\n#{user3.email}", plc_course_id: @plc_course.id
    assert_redirected_to action: :new, notice: "Enrollments created for #{user2.email}, #{user3.email}"
    assert_equal 1, Plc::UserCourseEnrollment.where(user: user2, plc_course: @plc_course).count
    assert_equal 1, Plc::UserCourseEnrollment.where(user: user3, plc_course: @plc_course).count

    assert_no_difference('Plc::UserCourseEnrollment.count') do
      post :create, user_emails: @user.email, plc_course_id: @plc_course.id
    end

    assert_redirected_to action: :new, notice: "Enrollments created for #{@user.email}"
  end

  test 'Enrollment is viewable in all possible enrollment states' do
    Plc::EnrollmentUnitAssignment::UNIT_STATUS_STATES.each do |status|
      @enrollment_unit_assignment.update!(status: status)

      get :index
    end
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

  test 'Can navigate to specific course with underscored url' do
    other_course = create(:plc_course, name: 'Other Course')
    create(:plc_user_course_enrollment, user: @user, plc_course: other_course)

    get :index, course: 'test-course'
    assert_select '.course_title', 'Test Course'

    @controller = Plc::UserCourseEnrollmentsController.new
    get :index, course: 'other-course'
    assert_select '.course_title', 'Other Course'

    @controller = Plc::UserCourseEnrollmentsController.new
    get :index
    assert_select '.course_title', 2
  end
end
