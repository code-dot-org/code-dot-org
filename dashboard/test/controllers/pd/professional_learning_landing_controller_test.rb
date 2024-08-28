require 'test_helper'

class Pd::ProfessionalLearningLandingControllerTest < ActionController::TestCase
  def prepare_scenario
    @csf_workshop = create :workshop, :ended, num_sessions: 3, course: Pd::Workshop::COURSE_CSF, ended_at: Time.zone.today - 1.day
    @csd_workshop = create :workshop, :ended, num_sessions: 3, course: Pd::Workshop::COURSE_CSD, ended_at: Time.zone.today - 2.days
    @csp_workshop = create :workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSP

    @teacher = create(:teacher, email: 'test_email@foo.com', user_type: 'teacher')
    other_teacher = create :teacher

    [@csf_workshop, @csd_workshop, @csp_workshop].each do |workshop|
      create :pd_enrollment, email: other_teacher.email, workshop: workshop
    end

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

  test 'Admin workshops do not show up as pending exit surveys' do
    # Fake Admin workshop, which should produce an exit survey
    admin_workshop = create :admin_workshop, :ended

    # Given a teacher that attended the workshop
    teacher = create :teacher
    go_to_workshop admin_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher
    # They do not see a prompt to take the Admin workshop exit survey
    response = assigns(:landing_page_data)
    refute response[:last_workshop_survey_url]
    refute response[:last_workshop_survey_course]
  end

  test 'Admin/Counselor workshops do not show up as pending exit surveys' do
    # Fake Admin/Counselor workshop, which should produce an exit survey
    admin_counselor_workshop = create :admin_counselor_workshop, :ended

    # Given a teacher that attended the workshop
    teacher = create :teacher
    go_to_workshop admin_counselor_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # They do not see a prompt to take the Admin workshop exit survey
    response = assigns(:landing_page_data)
    refute response[:last_workshop_survey_url]
    refute response[:last_workshop_survey_course]
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

  test 'EIR:Admin/Counselor workshops do not show up as pending exit surveys' do
    # Fake EIR workshop, which should not produce an exit survey
    eir_workshop = create :admin_counselor_workshop, :ended

    # Given a teacher that attended the workshop, such that they would get
    # a survey for any other workshop subject.
    teacher = create :teacher
    go_to_workshop eir_workshop, teacher

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
    csf_workshop = create :csf_workshop, :ended, ended_at: Time.zone.today - 1.day

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
    csf_workshop = create :csf_workshop, :ended, ended_at: Time.zone.today - 1.day

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

  test 'courses are sorted as expected' do
    prepare_scenario

    ['Bills Fandom 101', 'ECS Support', 'CSP Support'].each do |name|
      plc_course = UnitGroup.find_by(name: name).try(:plc_course) || create(:plc_course, name: name)
      Plc::UserCourseEnrollment.create(user: @teacher, plc_course: plc_course)
    end

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal(['CSP Support', 'ECS Support', 'Bills Fandom 101'], response[:summarized_plc_enrollments].map {|enrollment| enrollment[:courseName]})
  end

  test 'id of current year application is passed down' do
    prepare_scenario

    application = create :pd_teacher_application, user: @teacher, application_year: Pd::SharedApplicationConstants::APPLICATION_CURRENT_YEAR

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal application.id, response[:current_year_application_id]
  end

  test 'has_enrolled_in_workshops is true when user is enrolled workshops' do
    prepare_scenario

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert response[:has_enrolled_in_workshop]
  end

  test 'facilitated workshops are passed down' do
    prepare_scenario

    @teacher.permission = UserPermission::FACILITATOR
    workshop = create :pd_workshop, facilitators: [@teacher]
    create :pd_workshop, :ended, facilitators: [@teacher]
    @teacher.reload

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal 1, response[:workshops_as_facilitator].length
    assert_equal workshop.course_name, response[:workshops_as_facilitator].first[:course]
  end

  test 'organized workshops are passed down' do
    prepare_scenario

    @teacher.permission = UserPermission::WORKSHOP_ORGANIZER
    workshop = create :pd_workshop, organizer: @teacher
    create :pd_workshop, :ended, organizer: @teacher

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal 1, response[:workshops_as_organizer].length
    assert_equal workshop.course_name, response[:workshops_as_organizer].first[:course]
  end

  test 'workshops for regional partner are passed down' do
    prepare_scenario

    regional_partner = create :regional_partner
    @teacher.regional_partners << regional_partner
    workshop = create :pd_workshop, regional_partner: regional_partner
    create :pd_workshop, :ended, regional_partner: regional_partner

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal 1, response[:workshops_for_regional_partner].length
    assert_equal workshop.course_name, response[:workshops_for_regional_partner].first[:course]
  end

  test 'progress in PL courses is passed down' do
    prepare_scenario

    # User has completed all of this unit
    pl_unit1 = create :pl_unit, :with_lessons
    create :user_script, user: @teacher, script: pl_unit1
    unit1_level1 = create :level
    create :script_level, script: pl_unit1, levels: [unit1_level1], lesson: pl_unit1.lessons.first
    create :user_level, user: @teacher, level: unit1_level1, script: pl_unit1, best_result: ActivityConstants::MINIMUM_PASS_RESULT
    unit1_level2 = create :level
    create :script_level, script: pl_unit1, levels: [unit1_level2], lesson: pl_unit1.lessons.first
    create :user_level, user: @teacher, level: unit1_level2, script: pl_unit1, best_result: ActivityConstants::MINIMUM_PASS_RESULT
    pl_unit1.reload

    # User has completed some of this unit
    pl_unit2 = create :pl_unit, :with_lessons
    create :user_script, user: @teacher, script: pl_unit2
    unit2_level1 = create :level
    create :script_level, script: pl_unit2, levels: [unit2_level1], lesson: pl_unit2.lessons.first
    create :user_level, user: @teacher, level: unit2_level1, script: pl_unit2, best_result: ActivityConstants::MINIMUM_PASS_RESULT
    unit2_level2 = create :level
    create :script_level, script: pl_unit2, levels: [unit2_level2], lesson: pl_unit2.lessons.first
    pl_unit2.reload

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal 2, response[:pl_courses_started].length
    assert_equal([pl_unit1.name, pl_unit2.name], response[:pl_courses_started].map {|u| u[:name]})
    assert_equal 100, response[:pl_courses_started].find {|u| u[:name] == pl_unit1.name}[:percent_completed]
    assert_equal 50, response[:pl_courses_started].find {|u| u[:name] == pl_unit2.name}[:percent_completed]
  end

  test 'user permissions are passed down' do
    prepare_scenario

    @teacher.permission = UserPermission::PROGRAM_MANAGER
    @teacher.permission = UserPermission::FACILITATOR

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal ['authorized_teacher', 'program_manager', 'facilitator'].sort, response[:user_permissions].sort
  end

  test 'courses as facilitator are passed down' do
    prepare_scenario

    create :pd_course_facilitator, facilitator: @teacher, course: @csd_workshop.course
    create :pd_course_facilitator, facilitator: @teacher, course: @csp_workshop.course

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal [@csd_workshop.course, @csp_workshop.course], response[:courses_as_facilitator]
  end

  test 'workshop admins see application dashboard links' do
    workshop_admin = create :workshop_admin
    load_pl_landing workshop_admin
    assert_select '.extra-links' do
      assert_select 'a[href=?]', '/pd/application_dashboard'
    end
  end

  test 'workshop admins see workshop dashboard links' do
    workshop_admin = create :workshop_admin
    load_pl_landing workshop_admin
    assert_select '.extra-links' do
      assert_select 'a[href=?]', '/pd/workshop_dashboard'
    end
  end

  test "workshop organizers do not see extra links box" do
    workshop_organizer = create :workshop_organizer
    load_pl_landing workshop_organizer
    assert_select '.extra-links', count: 0
  end

  test "facilitators do not see extra links box" do
    facilitator = create :facilitator
    load_pl_landing facilitator
    assert_select '.extra-links', count: 0
  end

  test "program managers do not see extra links box" do
    program_manager = create :program_manager
    load_pl_landing program_manager
    assert_select '.extra-links', count: 0
  end

  test "teachers with no extra permissions do not see extra links box" do
    teacher = create :teacher
    load_pl_landing teacher
    assert_select '.extra-links', count: 0
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
