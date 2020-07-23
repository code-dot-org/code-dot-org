require 'test_helper'

class Pd::ProfessionalLearningLandingControllerTest < ::ActionController::TestCase
  def prepare_scenario
    @csf_workshop = create :workshop, :ended, num_sessions: 3, course: Pd::Workshop::COURSE_CSF, ended_at: Date.today - 1.day
    @csd_workshop = create :workshop, :ended, num_sessions: 3, course: Pd::Workshop::COURSE_CSD, ended_at: Date.today - 2.days
    @csp_workshop = create :workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSP

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
    prepare_scenario
    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal CDO.studio_url("/pd/workshop_survey/csf/post101/#{@ended_enrollment.code}", CDO.default_scheme),
      response[:last_workshop_survey_url]
    assert_equal Pd::Workshop::COURSE_CSF, response[:last_workshop_survey_course]
  end

  test 'Admin workshops may show up as pending exit surveys' do
    # Fake Admin workshop, which should produce an exit survey
    admin_workshop = create :admin_workshop, :ended

    # Given a teacher that attended the workshop
    teacher = create :teacher
    go_to_workshop admin_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # They see a prompt to take the Admin workshop exit survey
    response = assigns(:landing_page_data)
    enrollment = admin_workshop.enrollments.first
    assert_equal enrollment.exit_survey_url, response[:last_workshop_survey_url]
    assert_equal admin_workshop.course, response[:last_workshop_survey_course]
  end

  test 'FiT workshops do not show up as pending exit surveys' do
    # Fake FiT workshop, which should not produce an exit survey
    fit_workshop = create :fit_workshop, :ended

    # Given a teacher that attended the workshop, such that they would get
    # a survey for any other workshop subject.
    teacher = create :teacher
    go_to_workshop fit_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # Then they don't see a prompt for a pending exit survey
    # (That is, we didn't pass down the parameters that would cause that prompt to appear.)
    response = assigns(:landing_page_data)
    assert_nil response[:last_workshop_survey_url]
    assert_nil response[:last_workshop_survey_course]
  end

  test 'FiT workshops do not interfere with other pending exit surveys' do
    # Fake CSF workshop (older than the FiT workshop) which should
    # produce a pending exit survey
    csf_workshop = create :csf_workshop, :ended, ended_at: Date.today - 1.day

    # Fake FiT workshop, which should not produce an exit survey
    fit_workshop = create :fit_workshop, :ended

    # Given a teacher that attended both workshops
    teacher = create :teacher
    go_to_workshop csf_workshop, teacher
    go_to_workshop fit_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # They see a prompt to take the CSF workshop exit survey (not the more recent FiT workshop)
    response = assigns(:landing_page_data)
    csf_enrollment = csf_workshop.enrollments.first
    assert_equal csf_enrollment.exit_survey_url, response[:last_workshop_survey_url]
    assert_equal csf_workshop.course, response[:last_workshop_survey_course]
  end

  test 'Facilitator workshops do not show up as pending exit surveys' do
    # Fake FiT workshop, which should not produce an exit survey
    facilitator_workshop = create :facilitator_workshop, :ended

    # Given a teacher that attended the workshop, such that they would get
    # a survey for any other workshop subject.
    teacher = create :teacher
    go_to_workshop facilitator_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # Then they don't see a prompt for a pending exit survey
    # (That is, we didn't pass down the parameters that would cause that prompt to appear.)
    response = assigns(:landing_page_data)
    assert_nil response[:last_workshop_survey_url]
    assert_nil response[:last_workshop_survey_course]
  end

  test 'Facilitator workshops do not interfere with other pending exit surveys' do
    # Fake CSF workshop (older than the Facilitator workshop) which should
    # produce a pending exit survey
    csf_workshop = create :csf_workshop, :ended, ended_at: Date.today - 1.day

    # Fake Facilitator workshop, which should not produce an exit survey
    facilitator_workshop = create :facilitator_workshop, :ended

    # Given a teacher that attended both workshops
    teacher = create :teacher
    go_to_workshop csf_workshop, teacher
    go_to_workshop facilitator_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # They see a prompt to take the CSF workshop exit survey (not the more recent FiT workshop)
    response = assigns(:landing_page_data)
    csf_enrollment = csf_workshop.enrollments.first
    assert_equal csf_enrollment.exit_survey_url, response[:last_workshop_survey_url]
    assert_equal csf_workshop.course, response[:last_workshop_survey_course]
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
    create :plc_user_course_enrollment, user: no_workshop_teacher, plc_course: (create :plc_course, name: 'Course with no workshop')

    load_pl_landing no_workshop_teacher

    assert_empty Pd::Enrollment.for_user(no_workshop_teacher)
  end

  test 'courses are sorted as expected' do
    prepare_scenario

    ['Bills Fandom 101', 'ECS Support', 'CSP Support'].each do |name|
      plc_course = UnitGroup.find_by(name: name).try(:plc_course) || create(:plc_course, name: name)
      Plc::UserCourseEnrollment.create(user: @teacher, plc_course: plc_course)
    end

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal ['CSP Support', 'ECS Support', 'Bills Fandom 101'], response[:summarized_plc_enrollments].map {|enrollment| enrollment[:courseName]}
  end

  def go_to_workshop(workshop, teacher)
    enrollment = create :pd_enrollment, email: teacher.email, workshop: workshop
    create :pd_attendance, session: workshop.sessions.first, enrollment: enrollment
    enrollment
  end

  def load_pl_landing(teacher)
    sign_in teacher
    get :index
    assert_response :success
  end
end
