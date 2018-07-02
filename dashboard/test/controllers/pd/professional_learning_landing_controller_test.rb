require 'test_helper'

class Pd::ProfessionalLearningLandingControllerTest < ::ActionController::TestCase
  setup do
    @csf_workshop = create :pd_ended_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSF, ended_at: Date.today - 1.day
    @csd_workshop = create :pd_ended_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSD, ended_at: Date.today - 2.days
    @csp_workshop = create :pd_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSP

    @teacher = create(:teacher, email: 'test_email@foo.com', user_type: 'teacher')
    other_teacher = create :teacher

    [@csf_workshop, @csd_workshop, @csp_workshop].each do |workshop|
      create :pd_enrollment, email: other_teacher.email, workshop: workshop
    end

    create :pd_enrollment, email: @teacher.email, workshop: @csf_workshop
    @ended_enrollment = create :pd_enrollment, email: @teacher.email, workshop: @csf_workshop
    other_enrollment = create :pd_enrollment, email: @teacher.email, workshop: @csd_workshop
    create :pd_enrollment, email: @teacher.email, workshop: @csp_workshop

    Pd::Enrollment.stubs(:filter_for_survey_completion).returns([@ended_enrollment, other_enrollment])
  end

  test 'index returns expected values' do
    sign_in @teacher

    get :index
    assert_response :success
    response = assigns(:landing_page_data)

    assert_equal CDO.code_org_url("/pd-workshop-survey/#{@ended_enrollment.code}", CDO.default_scheme), response[:last_workshop_survey_url]
    assert_equal Pd::Workshop::COURSE_CSF, response[:last_workshop_survey_course]
  end

  test_redirect_to_sign_in_for :index

  test 'teachers without enrollments are redirected' do
    new_teacher = create :teacher
    sign_in new_teacher

    get :index
    assert_redirected_to CDO.code_org_url('educate/professional-learning', CDO.default_scheme)
  end

  test 'teachers with a plc enrollment (and no workshop enrollment) are not redirected' do
    no_workshop_teacher = create :teacher
    sign_in(no_workshop_teacher)
    create :plc_user_course_enrollment, user: no_workshop_teacher, plc_course: (create :plc_course, name: 'Course with no workshop')

    get :index
    assert_response :success
    assert_empty Pd::Enrollment.for_user(no_workshop_teacher)
  end

  test 'courses are sorted as expected' do
    sign_in(@teacher)

    ['Bills Fandom 101', 'ECS Support', 'CSP Support'].each do |name|
      plc_course = Course.find_by(name: name).try(:plc_course) || create(:plc_course, name: name)
      Plc::UserCourseEnrollment.create(user: @teacher, plc_course: plc_course)
    end

    get :index
    assert_response :success
    response = assigns(:landing_page_data)

    assert_equal ['CSP Support', 'ECS Support', 'Bills Fandom 101'], response[:summarized_plc_enrollments].map {|enrollment| enrollment[:courseName]}
  end
end
