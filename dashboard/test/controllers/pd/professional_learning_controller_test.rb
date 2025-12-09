require 'test_helper'

class Pd::ProfessionalLearningControllerTest < ActionController::TestCase
  def prepare_scenario
    @byo_workshop = create(:byo_workshop, :ended, num_sessions: 3, ended_at: Time.zone.today - 1.day)
    @csd_workshop = create(:workshop, :ended, num_sessions: 3, course: Pd::Workshop::COURSE_CSD, ended_at: Time.zone.today - 2.days)
    @csp_workshop = create(:workshop, num_sessions: 3, course: Pd::Workshop::COURSE_CSP)

    @teacher = create(:teacher, email: 'test_email@foo.com', user_type: 'teacher')
    other_teacher = create(:teacher)

    [@byo_workshop, @csd_workshop, @csp_workshop].each do |workshop|
      create(:pd_enrollment, email: other_teacher.email, workshop: workshop)
    end

    @ended_enrollment = create(:pd_enrollment, email: @teacher.email, workshop: @byo_workshop)
    other_enrollment = create(:pd_enrollment, email: @teacher.email, workshop: @csd_workshop)
    create(:pd_enrollment, email: @teacher.email, workshop: @csp_workshop)

    Pd::Enrollment.stubs(:filter_for_survey_completion).returns([@ended_enrollment, other_enrollment])
  end

  test 'index returns expected values' do
    prepare_scenario
    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal CDO.studio_url("/pd/workshop_survey/post/#{@ended_enrollment.code}", CDO.default_scheme),
      response[:last_workshop_survey_url]
    assert_equal Pd::Workshop::COURSE_BUILD_YOUR_OWN, response[:last_workshop_survey_course]
  end

  test 'Admin workshops do not show up as pending exit surveys' do
    # Fake Admin workshop, which should produce an exit survey
    admin_workshop = build(:admin_workshop, :ended)
    admin_workshop.save(validate: false)

    # Given a teacher that attended the workshop
    teacher = create(:teacher)
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
    admin_counselor_workshop = create(:admin_counselor_workshop, :ended)

    # Given a teacher that attended the workshop
    teacher = create(:teacher)
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
    fit_workshop = build(:fit_workshop, :ended)
    # workshop subject is deprecated so validation must be skipped
    fit_workshop.save(validate: false)

    # Given a teacher that attended the workshop, such that they would get
    # a survey for any other workshop subject.
    teacher = create(:teacher)
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
    eir_workshop = create(:admin_counselor_workshop, :ended)

    # Given a teacher that attended the workshop, such that they would get
    # a survey for any other workshop subject.
    teacher = create(:teacher)
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
    # Fake CSP workshop (older than the FiT workshop) which should
    # produce a pending exit survey
    csp_workshop = create(:workshop, :ended, ended_at: Time.zone.today - 1.day)

    # Fake FiT workshop, which should not produce an exit survey
    fit_workshop = build(:fit_workshop, :ended)
    # workshop subject is deprecated so validation must be skipped
    fit_workshop.save(validate: false)

    # Given a teacher that attended both workshops
    teacher = create(:teacher)
    go_to_workshop csp_workshop, teacher
    go_to_workshop fit_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # They see a prompt to take the CSF workshop exit survey (not the more recent FiT workshop)
    response = assigns(:landing_page_data)
    csp_enrollment = csp_workshop.enrollments.first
    assert_equal csp_enrollment.exit_survey_url, response[:last_workshop_survey_url]
    assert_equal csp_workshop.course, response[:last_workshop_survey_course]
  end

  test 'Facilitator workshops do not show up as pending exit surveys' do
    # Fake FiT workshop, which should not produce an exit survey
    facilitator_workshop = create(:facilitator_workshop, :ended)

    # Given a teacher that attended the workshop, such that they would get
    # a survey for any other workshop subject.
    teacher = create(:teacher)
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
    # Fake CSP workshop (older than the Facilitator workshop) which should
    # produce a pending exit survey
    csp_workshop = create(:workshop, :ended, ended_at: Time.zone.today - 1.day)

    # Fake Facilitator workshop, which should not produce an exit survey
    facilitator_workshop = create(:facilitator_workshop, :ended)

    # Given a teacher that attended both workshops
    teacher = create(:teacher)
    go_to_workshop csp_workshop, teacher
    go_to_workshop facilitator_workshop, teacher

    # When the teacher loads the PL landing page
    load_pl_landing teacher

    # They see a prompt to take the CSF workshop exit survey (not the more recent FiT workshop)
    response = assigns(:landing_page_data)
    csp_enrollment = csp_workshop.enrollments.first
    assert_equal csp_enrollment.exit_survey_url, response[:last_workshop_survey_url]
    assert_equal csp_workshop.course, response[:last_workshop_survey_course]
  end

  test_redirect_to_sign_in_for :index

  test 'show_deeper_learning is true if user is enrolled in PL courses' do
    prepare_scenario

    ['Bills Fandom 101', 'ECS Support', 'CSP Support'].each do |name|
      plc_course = UnitGroup.find_by(name: name).try(:plc_course) || create(:plc_course, name: name)
      Plc::UserCourseEnrollment.create(user: @teacher, plc_course: plc_course)
    end

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert response[:show_deeper_learning]
  end

  test 'has_enrolled_in_workshops is true when user is enrolled workshops' do
    prepare_scenario

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert response[:has_enrolled_in_workshop]
  end

  test 'progress in PL courses is passed down' do
    prepare_scenario

    # User has completed all of this unit
    pl_unit1 = create(:single_unit_course, :pl_course, unit: create(:script, :with_lessons)).first_unit
    create(:user_script, user: @teacher, script: pl_unit1)
    unit1_level1 = create(:level)
    create(:script_level, script: pl_unit1, levels: [unit1_level1], lesson: pl_unit1.lessons.first)
    create(:user_level, user: @teacher, level: unit1_level1, script: pl_unit1, best_result: ActivityConstants::MINIMUM_PASS_RESULT)
    unit1_level2 = create(:level)
    create(:script_level, script: pl_unit1, levels: [unit1_level2], lesson: pl_unit1.lessons.first)
    create(:user_level, user: @teacher, level: unit1_level2, script: pl_unit1, best_result: ActivityConstants::MINIMUM_PASS_RESULT)
    pl_unit1.reload

    # User has completed some of this unit
    pl_unit2 = create(:single_unit_course, :pl_course, unit: create(:script, :with_lessons)).first_unit
    create(:user_script, user: @teacher, script: pl_unit2)
    unit2_level1 = create(:level)
    create(:script_level, script: pl_unit2, levels: [unit2_level1], lesson: pl_unit2.lessons.first)
    create(:user_level, user: @teacher, level: unit2_level1, script: pl_unit2, best_result: ActivityConstants::MINIMUM_PASS_RESULT)
    unit2_level2 = create(:level)
    create(:script_level, script: pl_unit2, levels: [unit2_level2], lesson: pl_unit2.lessons.first)
    pl_unit2.reload

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal 2, response[:pl_courses_started].length
    assert_equal([pl_unit1.name, pl_unit2.name], response[:pl_courses_started].pluck(:name))
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

    create(:pd_course_facilitator, facilitator: @teacher, course: @csd_workshop.course)
    create(:pd_course_facilitator, facilitator: @teacher, course: @csp_workshop.course)

    load_pl_landing @teacher

    response = assigns(:landing_page_data)
    assert_equal [@csd_workshop.course, @csp_workshop.course], response[:courses_as_facilitator]
  end

  test 'workshop admins see workshop dashboard links' do
    workshop_admin = create(:workshop_admin)
    load_pl_landing workshop_admin
    assert_select '.extra-links' do
      assert_select 'a[href=?]', '/pd/workshop_dashboard'
    end
  end

  test "workshop organizers do not see extra links box" do
    workshop_organizer = create(:workshop_organizer)
    load_pl_landing workshop_organizer
    assert_select '.extra-links', count: 0
  end

  test "facilitators do not see extra links box" do
    facilitator = create(:facilitator)
    load_pl_landing facilitator
    assert_select '.extra-links', count: 0
  end

  test "program managers do not see extra links box" do
    program_manager = create(:program_manager)
    load_pl_landing program_manager
    assert_select '.extra-links', count: 0
  end

  test "teachers with no extra permissions do not see extra links box" do
    teacher = create(:teacher)
    load_pl_landing teacher
    assert_select '.extra-links', count: 0
  end

  test 'workshops_as_facilitator_for_pl_page returns live facilitated workshops' do
    prepare_scenario
    facilitator = create(:facilitator)
    load_pl_landing facilitator

    # Check that no workshops are returned if user isn't facilitating any
    no_workshops_response = get :workshops_as_facilitator_for_pl_page
    assert_equal [], JSON.parse(no_workshops_response.body)['workshops_as_facilitator']

    # Set up workshops the user facilitated
    later_workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSD, sessions: [session_on_day(3)], facilitators: [facilitator])
    earlier_workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSA, sessions: [session_on_day(1)], facilitators: [facilitator])
    create(:pd_workshop, :ended, facilitators: [facilitator])
    facilitator.reload

    # Only returns workshops that are not ended
    facilitated_workshops_response = get :workshops_as_facilitator_for_pl_page
    facilitated_workshop_courses = JSON.parse(facilitated_workshops_response.body)['workshops_as_facilitator'].map {|w| w['course']}
    assert_equal [earlier_workshop.course, later_workshop.course], facilitated_workshop_courses
  end

  test 'workshops_as_organizer_for_pl_page returns live organized workshops' do
    prepare_scenario
    workshop_organizer = create(:workshop_organizer)
    load_pl_landing workshop_organizer

    # Check that no workshops are returned if user isn't organizing any
    no_workshops_response = get :workshops_as_organizer_for_pl_page
    assert_equal [], JSON.parse(no_workshops_response.body)['workshops_as_organizer']

    # Set up workshops the user organized
    later_workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSD, sessions: [session_on_day(3)], organizer: workshop_organizer)
    earlier_workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSA, sessions: [session_on_day(1)], organizer: workshop_organizer)
    create(:pd_workshop, :ended, organizer: workshop_organizer)

    # Only returns workshops that are not ended (sorted by start date)
    organized_workshops_response = get :workshops_as_organizer_for_pl_page
    organized_workshop_courses = JSON.parse(organized_workshops_response.body)['workshops_as_organizer'].map {|w| w['course']}
    assert_equal [earlier_workshop.course, later_workshop.course], organized_workshop_courses
  end

  test 'workshops_as_program_manager_for_pl_page returns live workshops user is program manager of' do
    prepare_scenario
    program_manager = create(:program_manager)
    load_pl_landing program_manager

    # Check that no workshops are returned if user isn't the program manager for any
    no_workshops_response = get :workshops_as_program_manager_for_pl_page
    assert_equal [], JSON.parse(no_workshops_response.body)['workshops_as_program_manager']

    # Set up workshops the user is the program manager of
    later_workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSD, sessions: [session_on_day(3)], organizer: program_manager)
    earlier_workshop = create(:pd_workshop, course: Pd::Workshop::COURSE_CSA, sessions: [session_on_day(1)], organizer: program_manager)
    create(:pd_workshop, :ended, organizer: program_manager)

    # Only returns workshops that are not ended (sorted by start date)
    program_manager_workshops_response = get :workshops_as_program_manager_for_pl_page
    program_manager_workshop_courses = JSON.parse(program_manager_workshops_response.body)['workshops_as_program_manager'].map {|w| w['course']}
    assert_equal [earlier_workshop.course, later_workshop.course], program_manager_workshop_courses
  end

  test 'signed out user trying to view facilitator landing pages is sent to sign in page' do
    get :csa
    assert_redirected_to '/users/sign_in'

    get :csd
    assert_redirected_to '/users/sign_in'

    get :csf
    assert_redirected_to '/users/sign_in'

    get :csp
    assert_redirected_to '/users/sign_in'

    get :aif
    assert_redirected_to '/users/sign_in'
  end

  test 'csa facilitator landing page only loads for users with one of the necessary permissions' do
    setup_facilitator_landing_users
    can_view = [@program_manager, @workshop_organizer, @workshop_admin, @csa_facilitator]
    cannot_view = [@teacher, @csd_facilitator, @csf_facilitator, @csp_facilitator, @aif_facilitator]

    can_view.each do |can_view_user|
      sign_in can_view_user
      get :csa
      assert_template 'pd/professional_learning/facilitator/csa'
      sign_out can_view_user
    end

    cannot_view.each do |cannot_view_user|
      sign_in cannot_view_user
      get :csa
      assert_template 'pd/professional_learning/facilitator/not_permitted_to_view'
      sign_out cannot_view_user
    end
  end

  test 'csd facilitator landing page only loads for users with one of the necessary permissions' do
    setup_facilitator_landing_users
    can_view = [@program_manager, @workshop_organizer, @workshop_admin, @csd_facilitator]
    cannot_view = [@teacher, @csa_facilitator, @csf_facilitator, @csp_facilitator, @aif_facilitator]

    can_view.each do |can_view_user|
      sign_in can_view_user
      get :csd
      assert_template 'pd/professional_learning/facilitator/csd'
      sign_out can_view_user
    end

    cannot_view.each do |cannot_view_user|
      sign_in cannot_view_user
      get :csd
      assert_template 'pd/professional_learning/facilitator/not_permitted_to_view'
      sign_out cannot_view_user
    end
  end

  test 'csf facilitator landing page only loads for users with one of the necessary permissions' do
    setup_facilitator_landing_users
    can_view = [@program_manager, @workshop_organizer, @workshop_admin, @csf_facilitator]
    cannot_view = [@teacher, @csa_facilitator, @csd_facilitator, @csp_facilitator, @aif_facilitator]

    can_view.each do |can_view_user|
      sign_in can_view_user
      get :csf
      assert_template 'pd/professional_learning/facilitator/csf'
      sign_out can_view_user
    end

    cannot_view.each do |cannot_view_user|
      sign_in cannot_view_user
      get :csf
      assert_template 'pd/professional_learning/facilitator/not_permitted_to_view'
      sign_out cannot_view_user
    end
  end

  test 'csp facilitator landing page only loads for users with one of the necessary permissions' do
    setup_facilitator_landing_users
    can_view = [@program_manager, @workshop_organizer, @workshop_admin, @csp_facilitator]
    cannot_view = [@teacher, @csa_facilitator, @csd_facilitator, @csf_facilitator, @aif_facilitator]

    can_view.each do |can_view_user|
      sign_in can_view_user
      get :csp
      assert_template 'pd/professional_learning/facilitator/csp'
      sign_out can_view_user
    end

    cannot_view.each do |cannot_view_user|
      sign_in cannot_view_user
      get :csp
      assert_template 'pd/professional_learning/facilitator/not_permitted_to_view'
      sign_out cannot_view_user
    end
  end

  test 'aif facilitator landing page only loads for users with one of the necessary permissions' do
    setup_facilitator_landing_users
    can_view = [@program_manager, @workshop_organizer, @workshop_admin, @aif_facilitator]
    cannot_view = [@teacher, @csa_facilitator, @csd_facilitator, @csf_facilitator, @csp_facilitator]

    can_view.each do |can_view_user|
      sign_in can_view_user
      get :aif
      assert_template 'pd/professional_learning/facilitator/aif'
      sign_out can_view_user
    end

    cannot_view.each do |cannot_view_user|
      sign_in cannot_view_user
      get :aif
      assert_template 'pd/professional_learning/facilitator/not_permitted_to_view'
      sign_out cannot_view_user
    end
  end

  test 'regional partner landing page only loads for users with one of the necessary permissions' do
    @program_manager = create(:program_manager)
    @workshop_admin = create(:workshop_admin)
    @teacher = create(:teacher)

    # Program Managers and Workshop Admins can view the page
    sign_in @program_manager
    get :rp_playbook
    assert_template 'pd/professional_learning/regional_partner/regional_partner_playbook'
    sign_out @program_manager

    sign_in @workshop_admin
    get :rp_playbook
    assert_template 'pd/professional_learning/regional_partner/regional_partner_playbook'
    sign_out @workshop_admin

    # Users without one of those permissions cannot view it
    sign_in @teacher
    get :rp_playbook
    assert_template 'pd/professional_learning/regional_partner/not_permitted_to_view'
  end

  test 'regional_workshop_data returns empty results if no results' do
    RegionalPartner.stubs(:find_by_zip).with("00000").returns([nil, nil])

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "00000"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshops = response_data['available_regional_workshops']

    assert_nil response_rp['name']
    assert_equal [], response_workshops
  end

  test 'regional_workshop_data only returns workshops under their regional partner' do
    nearby_rp = create(:regional_partner, name: "RP_in_users_region")
    nearby_rp.mappings.find_or_create_by!(zip_code: "11111")
    distant_rp = create(:regional_partner, name: "RP_outside_of_users_region")
    distant_rp.mappings.find_or_create_by!(zip_code: "99999")
    nearby_rp_pm_1 = create(:program_manager, regional_partner: nearby_rp)
    nearby_rp_pm_2 = create(:program_manager, regional_partner: nearby_rp)
    distant_rp_pm = create(:program_manager, regional_partner: distant_rp)

    nearby_regional_ws_1 = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: nearby_rp_pm_1)
    nearby_regional_ws_2 = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: nearby_rp_pm_2)
    nearby_national_ws = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'National', organizer: nearby_rp_pm_2)
    create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: distant_rp_pm)

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal nearby_rp.name, response_rp['name']
    assert_equal [nearby_regional_ws_1.id, nearby_regional_ws_2.id, nearby_national_ws.id], response_workshop_ids
  end

  test 'regional_workshop_data only returns workshops that have not been started' do
    rp = create(:regional_partner)
    rp.mappings.find_or_create_by!(zip_code: "11111")
    pm = create(:program_manager, regional_partner: rp)
    not_started_ws = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm)
    create(:byo_workshop, :in_progress, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm)
    create(:byo_workshop, :ended, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm)

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal rp.name, response_rp['name']
    assert_equal [not_started_ws.id], response_workshop_ids
  end

  test 'regional_workshop_data only returns workshops that have start times in the future' do
    rp = create(:regional_partner)
    rp.mappings.find_or_create_by!(zip_code: "11111")
    pm = create(:program_manager, regional_partner: rp)
    future_workshop = create(:byo_workshop, participant_group_type: 'Regional', organizer: pm, sessions: [create(:pd_session, start: DateTime.now.beginning_of_day + 1.month, end: DateTime.now.beginning_of_day + 1.month + 1.hour)])
    create(:byo_workshop, participant_group_type: 'Regional', organizer: pm, sessions: [create(:pd_session, start: DateTime.now.beginning_of_day - 1.month, end: DateTime.now.beginning_of_day - 1.month + 1.hour)])

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal rp.name, response_rp['name']
    assert_equal [future_workshop.id], response_workshop_ids
  end

  test 'regional_workshop_data only returns workshops that are not hidden' do
    rp = create(:regional_partner)
    rp.mappings.find_or_create_by!(zip_code: "11111")
    pm = create(:program_manager, regional_partner: rp)
    hidden_nil_ws = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm)
    hidden_false_ws = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm, hidden: false)
    create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm, hidden: true)

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal rp.name, response_rp['name']
    assert_equal [hidden_nil_ws.id, hidden_false_ws.id], response_workshop_ids
  end

  test 'regional_workshop_data returns CSF workshops' do
    rp = create(:regional_partner)
    rp.mappings.find_or_create_by!(zip_code: "11111")
    pm = create(:program_manager, regional_partner: rp)
    csf_workshop = build(:workshop, course: Pd::Workshop::COURSE_CSF, subject: Pd::Workshop::SUBJECT_CSF_101, sessions: [session_on_day(1)], organizer: pm)
    csf_workshop.save(validate: false)

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal rp.name, response_rp['name']
    assert_equal [csf_workshop.id], response_workshop_ids
  end

  test 'regional_workshop_data does not return CSD, CSP, or CSA workshops when applications are closed' do
    rp = create(:regional_partner)
    rp.mappings.find_or_create_by!(zip_code: "11111")
    pm = create(:program_manager, regional_partner: rp)
    create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: pm)
    create(:workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: pm)
    create(:workshop, course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: pm)
    byow = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm)

    DCDO.stubs(:get).with('pl-teacher-application-off-season', false).returns(true)

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal rp.name, response_rp['name']
    assert_equal [byow.id], response_workshop_ids

    DCDO.unstub(:get)
  end

  test 'regional_workshop_data only returns traditional 5-day summer CSD, CSP, and CSA workshops associated with the regional partner when applications are open' do
    rp = create(:regional_partner)
    rp.mappings.find_or_create_by!(zip_code: "11111")
    pm = create(:program_manager, regional_partner: rp)
    distant_rp = create(:regional_partner)
    distant_rp.mappings.find_or_create_by!(zip_code: "99999")
    distant_pm = create(:program_manager, regional_partner: distant_rp)

    # Summer CSD, CSP, CSA workshops under the user's regional partner
    summer_csd = create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: pm)
    summer_csp = create(:workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: pm)
    summer_csa = create(:workshop, course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: pm)

    # Summer CSD, CSP, CSA workshops under a different regional partner
    create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: distant_pm)
    create(:workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: distant_pm)
    create(:workshop, course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)], organizer: distant_pm)

    # AYW workshops
    create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_WORKSHOP_1, sessions: [session_on_day(1)], organizer: pm)
    create(:workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_WORKSHOP_1, sessions: [session_on_day(1)], organizer: pm)
    create(:workshop, course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_WORKSHOP_1, sessions: [session_on_day(1)], organizer: pm)

    # Non-[CSD, CSP, CSA] workshop
    byow = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional', organizer: pm)

    DCDO.stubs(:get).with('pl-teacher-application-off-season', false).returns(false)

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal rp.name, response_rp['name']
    assert_equal [summer_csd.id, summer_csp.id, summer_csa.id, byow.id], response_workshop_ids

    DCDO.unstub(:get)
  end

  test 'regional_workshop_data returns available workshops sorted by start date of first session' do
    rp = create(:regional_partner)
    rp.mappings.find_or_create_by!(zip_code: "11111")
    pm = create(:program_manager, regional_partner: rp)
    third_ws = create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, organizer: pm, sessions: [session_on_day(10)])
    second_ws = create(:workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, organizer: pm, sessions: [session_on_day(5)])
    first_ws = create(:workshop, course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, organizer: pm, sessions: [session_on_day(1)])

    reg_ws_data_response = get :regional_workshop_data, params: {zip_code: "11111"}
    assert_response :success
    response_data = JSON.parse(reg_ws_data_response.body)['regional_workshop_data']
    response_rp = response_data['regional_partner']
    response_workshop_ids = response_data['available_regional_workshops'].map {|ws| ws['id']}

    assert_equal rp.name, response_rp['name']
    assert_equal [first_ws.id, second_ws.id, third_ws.id], response_workshop_ids
  end

  test 'national_workshop_data returns empty array if no results' do
    assert_equal [], Pd::ProfessionalLearningController.national_workshop_data
  end

  test 'national_workshop_data only returns national Build Your Own workshops' do
    national_byo_workshop = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'National')
    create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'Regional')
    create(:workshop, course: Pd::Workshop::COURSE_CSD, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)])
    create(:workshop, course: Pd::Workshop::COURSE_CSP, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)])
    create(:workshop, course: Pd::Workshop::COURSE_CSA, subject: Pd::Workshop::SUBJECT_SUMMER_WORKSHOP, sessions: [session_on_day(1)])

    assert_equal [national_byo_workshop.id], Pd::ProfessionalLearningController.national_workshop_data.pluck(:id)
  end

  test 'national_workshop_data only returns workshops that are not started and start in the future' do
    starts_in_future = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'National')
    create(:byo_workshop, :in_progress, sessions: [session_on_day(1)], participant_group_type: 'National')
    create(:byo_workshop, :ended, sessions: [session_on_day(1)], participant_group_type: 'National')
    create(:byo_workshop, sessions: [(create(:pd_session, start: Time.zone.today - 5.days + 9.hours, end: Time.zone.today - 5.days + 17.hours))], participant_group_type: 'National')

    assert_equal [starts_in_future.id], Pd::ProfessionalLearningController.national_workshop_data.pluck(:id)
  end

  test 'national_workshop_data does not return hidden workshops' do
    non_hidden_workshop = create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'National')
    create(:byo_workshop, sessions: [session_on_day(1)], participant_group_type: 'National', hidden: true)

    assert_equal [non_hidden_workshop.id], Pd::ProfessionalLearningController.national_workshop_data.pluck(:id)
  end

  test 'logged-out users can view workshop marketing page' do
    workshop = create(:workshop)
    get :workshop_marketing_page, params: {workshop_id: workshop.id}

    assert_response :success
    assert_template :index
  end

  test 'students can view workshop marketing page' do
    workshop = create(:workshop)
    student = create(:student)
    sign_in student
    get :workshop_marketing_page, params: {workshop_id: workshop.id}

    assert_response :success
    assert_template :index
  end

  test 'teachers can view workshop marketing page' do
    workshop = create(:workshop)
    teacher = create(:teacher)
    sign_in teacher
    get :workshop_marketing_page, params: {workshop_id: workshop.id}

    assert_response :success
    assert_template :index
  end

  private def go_to_workshop(workshop, teacher)
    enrollment = create(:pd_enrollment, email: teacher.email, workshop: workshop)
    create(:pd_attendance, session: workshop.sessions.first, enrollment: enrollment)
    enrollment
  end

  private def load_pl_landing(teacher)
    sign_in teacher
    get :index
    assert_response :success
  end

  private def session_on_day(day_offset)
    day = Time.zone.today + day_offset.days
    create(:pd_session, start: day + 9.hours, end: day + 17.hours)
  end

  private def setup_facilitator_landing_users
    @teacher = create(:teacher)
    @workshop_admin = create(:workshop_admin)
    @workshop_organizer = create(:workshop_organizer)
    @program_manager = create(:program_manager)
    @csa_facilitator = create(:facilitator)
    @csa_facilitator.course_as_facilitator = Pd::Workshop::COURSE_CSA
    @csd_facilitator = create(:facilitator)
    @csd_facilitator.course_as_facilitator = Pd::Workshop::COURSE_CSD
    @csf_facilitator = create(:facilitator)
    @csf_facilitator.course_as_facilitator = Pd::Workshop::COURSE_CSF
    @csp_facilitator = create(:facilitator)
    @csp_facilitator.course_as_facilitator = Pd::Workshop::COURSE_CSP
    @aif_facilitator = create(:facilitator)
    @aif_facilitator.course_as_facilitator = Pd::Workshop::COURSE_AIF
  end
end
