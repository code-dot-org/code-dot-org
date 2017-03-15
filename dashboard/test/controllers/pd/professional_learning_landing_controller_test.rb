require 'test_helper'

class Pd::ProfessionalLearningLandingControllerTest < ::ActionController::TestCase
  setup do
    @csf_workshop = create :pd_ended_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSF, subject: nil
    @csd_workshop = create :pd_ended_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSD, subject: nil
    @csp_workshop = create :pd_workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_CSP_SUMMER_WORKSHOP

    @teacher = create(:admin, email: 'test_email@foo.com', user_type: 'teacher')
    other_teacher = create :teacher

    [@csf_workshop, @csd_workshop, @csp_workshop].each do |workshop|
      create :pd_enrollment, email: other_teacher.email, workshop: workshop
    end

    create :pd_enrollment, email: @teacher.email, workshop: @csf_workshop
    @ended_enrollment = create :pd_enrollment, email: @teacher.email, workshop: @csf_workshop, survey_sent_at: Date.today - 1.days
    other_enrollment = create :pd_enrollment, email: @teacher.email, workshop: @csd_workshop, survey_sent_at: Date.today - 2.days
    create :pd_enrollment, email: @teacher.email, workshop: @csp_workshop

    Pd::Enrollment.stubs(:filter_for_survey_completion).returns([@ended_enrollment, other_enrollment])
  end

  test 'index returns expected values' do
    sign_in @teacher

    get :index
    assert_response :success
    response = assigns(:landing_page_data)

    assert_equal [Pd::Workshop::COURSE_CSF, Pd::Workshop::COURSE_CSD, Pd::Workshop::COURSE_CSP], response[:courses_teaching]
    assert_equal [Pd::Workshop::COURSE_CSF, Pd::Workshop::COURSE_CSD], response[:courses_completed]
    assert_equal "#{CDO.code_org_url}/pd-workshop-survey/#{@ended_enrollment.code}", response[:last_workshop_survey_url]
    assert_equal CDO.studio_url("/pd/generate_csf_certificate/#{@ended_enrollment.code}"), response[:print_csf_certificate_url]
    assert_equal Pd::Workshop::COURSE_CSF, response[:last_workshop_survey_course]
  end

  test_user_gets_response_for :index, name: 'admins only', user: :teacher, response: :forbidden

  test 'courses are sorted as expected' do
    sign_in(@teacher)

    some_other_course = create :plc_course, name: 'Bills Fandom 101'
    ecs_support = create :plc_course, name: 'ECS Support'
    csp_support = create :plc_course, name: 'CSP Support'

    [some_other_course, ecs_support, csp_support].each do |course|
      create :plc_user_course_enrollment, user: @teacher, plc_course: course
    end

    get :index
    assert_response :success
    response = assigns(:landing_page_data)

    assert_equal ['CSP Support', 'ECS Support', 'Bills Fandom 101'], response[:summarized_plc_enrollments].map { |enrollment| enrollment[:courseName]}
  end
end
