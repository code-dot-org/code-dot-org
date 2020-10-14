require 'test_helper'

class Plc::UserCourseEnrollmentsControllerTest < ActionController::TestCase
  setup do
    @admin = create :admin
    sign_in(@admin)
    @plc_course = create(:plc_course, name: 'Test Course')
    @user_course_enrollment = create(:plc_user_course_enrollment, user: @admin, plc_course: @plc_course)
    @course_unit = create(:plc_course_unit, plc_course: @plc_course)
    @enrollment_unit_assignment = create(
      :plc_enrollment_unit_assignment,
      plc_course_unit: @course_unit,
      plc_user_course_enrollment: @user_course_enrollment,
      user: @admin
    )
    @district_contact = create :district_contact
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test 'invalid email address' do
    post :create, params: {
      user_emails: 'invalid',
      plc_course_id: @plc_course.id
    }
    assert_redirected_to action: :new, notice: '1 user(s) did not exist: <li>invalid</li><br/>'

    post :create, params: {
      user_emails: "invalid\r\n#{@admin.email}",
      plc_course_id: @plc_course.id
    }
    assert_redirected_to action: :new, notice: "1 enrollment(s) created: <li>#{@admin.email}</li><br/>1 user(s) did not exist: <li>invalid</li><br/>"
  end

  test 'validation failed' do
    assert_raise do
      post :create, params: {user_emails: @admin.email, plc_course_id: nil}
    end
  end

  test "should create plc_user_course_enrollment" do
    @user_course_enrollment.destroy

    assert_creates(Plc::UserCourseEnrollment) do
      post :create, params: {
        user_emails: @admin.email,
        plc_course_id: @plc_course.id
      }
    end

    assert_redirected_to action: :new, notice: "1 enrollment(s) created: <li>#{@admin.email}</li><br/>"

    user2 = create :teacher
    user3 = create :teacher

    post :create, params: {
      user_emails: "#{user2.email}\r\n#{user3.email}",
      plc_course_id: @plc_course.id
    }
    assert_redirected_to action: :new, notice: "2 enrollment(s) created: <li>#{user2.email}</li><li>#{user3.email}</li><br/>"
    assert_equal 1, Plc::UserCourseEnrollment.where(user: user2, plc_course: @plc_course).count
    assert_equal 1, Plc::UserCourseEnrollment.where(user: user3, plc_course: @plc_course).count

    assert_no_difference('Plc::UserCourseEnrollment.count') do
      post :create, params: {
        user_emails: @admin.email,
        plc_course_id: @plc_course.id
      }
    end

    assert_redirected_to action: :new, notice: "1 enrollment(s) created: <li>#{@admin.email}</li><br/>"
  end

  test "only return first 10 enrollments created" do
    @user_course_enrollment.destroy

    teacher_emails = []
    (1..12).each do |_|
      teacher = create :teacher
      teacher_emails << teacher.email
    end

    invalid_emails = []
    (1..11).each do |i|
      invalid_emails << "invalid#{i}"
    end

    emails = teacher_emails.join("\r\n")
    emails += "\r\n" + invalid_emails.join("\r\n")

    post :create, params: {
      user_emails: emails,
      plc_course_id: @plc_course.id
    }

    expected_teacher_emails = ""
    teacher_emails[0..9].each {|email| expected_teacher_emails += "<li>#{email}</li>"}
    expected_invalid_emails = ""
    invalid_emails[0..9].each {|email| expected_invalid_emails += "<li>#{email}</li>"}
    expected_notice = "12 enrollment(s) created. The first 10 are: #{expected_teacher_emails}<br/>" \
      "11 user(s) did not exist. The first 10 are: #{expected_invalid_emails}<br/>"
    assert_redirected_to action: :new, notice: expected_notice
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
    get :manager_view, params: {id: @user_course_enrollment}
    assert_response :success
  end

  test 'Teachers can view dashboard but not group view' do
    sign_out @admin
    teacher = create :teacher

    sign_in(teacher)
    get :index
    assert_response :success
    get :group_view
    assert_response :forbidden
    get :manager_view, params: {id: @user_course_enrollment}
    assert_response :forbidden
  end

  test 'Students cannot access course view nor group view' do
    sign_out @admin
    student = create :student

    sign_in(student)
    get :index
    assert_response :forbidden
    get :group_view
    assert_response :forbidden
    get :manager_view, params: {id: @user_course_enrollment}
    assert_response :forbidden
  end

  test 'District managers cannot view teachers they do not manage' do
    sign_out @admin
    sign_in @district_contact

    get :manager_view, params: {id: @user_course_enrollment}
    assert_response :forbidden
  end

  test 'Signed out users get redirected to sign in' do
    sign_out @admin
    assert_signed_in_as nil

    get :index
    assert_redirected_to_sign_in
  end

  test 'Can navigate to specific course with underscored url' do
    other_course = create(:plc_course, name: 'Other Course', id: Plc::Course.maximum(:id).next)
    create(:plc_user_course_enrollment, user: @admin, plc_course: other_course)

    get :index, params: {course: 'test-course'}
    assert_select '.course_title', 'Test Course'

    @controller = Plc::UserCourseEnrollmentsController.new
    get :index, params: {course: 'other-course'}
    assert_select '.course_title', 'Other Course'

    @controller = Plc::UserCourseEnrollmentsController.new
    get :index
    assert_select '.course_title', 2
  end
end
