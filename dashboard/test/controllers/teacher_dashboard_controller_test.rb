require 'test_helper'

class TeacherDashboardControllerTest < ActionController::TestCase
  setup_all do
    @section_owner = create(:teacher)
    @sections = create_list(:section, 3, user: @section_owner)
    @section = @sections.first
  end

  test 'index: redirects home if no logged in user' do
    get :show, params: {section_id: @section.id}
    assert_response :redirect
    assert_redirected_to "http://test.host/home"
  end

  test 'index: redirects home if logged in user is not a teacher' do
    sign_in create(:student)
    get :show, params: {section_id: @section.id}
    assert_response :redirect
    assert_redirected_to "http://test.host/home"
  end

  test 'index: redirects home if requested section does not belong to teacher' do
    sign_in @section_owner
    other_teacher_section = create(:section)
    get :show, params: {section_id: other_teacher_section.id}
    assert_response :redirect
    assert_redirected_to "http://test.host/home"
  end

  test 'index: returns success if requested section belongs to the section owner' do
    sign_in @section_owner
    section = create(:section, user: @section_owner)
    get :show, params: {section_id: section.id}
    assert_response :success
  end

  test 'index: redirects to generic course page if requested section does not belong to teacher' do
    @section_owner_2 = create(:teacher)
    @sections_2 = create_list(:section, 3, user: @section_owner_2)
    @section_2 = @sections_2.first
    sign_in @section_owner_2
    section = create(:section, user: @section_owner)
    get :show, params: {section_id: section.id, path: 'courses/csd-2024'}
    assert_response :redirect
    assert_redirected_to "http://test.host/courses/csd-2024"
  end

  test 'show: sets show_section_creation_celebration_dialog when param present' do
    sign_in @section_owner
    get :show, params: {showSectionCreationDialog: 'true'}
    assert assigns(:show_section_creation_celebration_dialog)
  end

  test 'show: does not set show_section_creation_celebration_dialog when param absent' do
    sign_in @section_owner
    get :show
    refute assigns(:show_section_creation_celebration_dialog)
  end

  test 'index: returns success if requested section is an instructed section for a coteacher' do
    cotaught_section = create(:section, user: @section_owner, login_type: 'word')
    other_teacher = create(:teacher)
    create(:section_instructor, instructor: other_teacher, section: cotaught_section, status: :active)

    sign_in other_teacher
    get :show, params: {section_id: cotaught_section.id}
    assert_response :success
  end

  test 'lesson_summaries_enabled_for_unit: returns true for AIF units' do
    sign_in @section_owner
    unit = create(:script)
    unit.curriculum_umbrella = Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.foundations_of_cs
    unit.save!

    get :lesson_summaries_enabled_for_unit, params: {unit_id: unit.id}
    assert_response :success
    assert_equal true, JSON.parse(response.body)['enabled']
  end

  test 'lesson_summaries_enabled_for_unit: returns true for AID units' do
    sign_in @section_owner
    unit = create(:script)
    unit.curriculum_umbrella = Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.AID
    unit.save!

    get :lesson_summaries_enabled_for_unit, params: {unit_id: unit.id}
    assert_response :success
    assert_equal true, JSON.parse(response.body)['enabled']
  end

  test 'lesson_summaries_enabled_for_unit: returns false for units outside AIF and AID' do
    sign_in @section_owner
    unit = create(:script)
    unit.curriculum_umbrella = Curriculum::SharedCourseConstants::CURRICULUM_UMBRELLA.CSD
    unit.save!

    get :lesson_summaries_enabled_for_unit, params: {unit_id: unit.id}
    assert_response :success
    assert_equal false, JSON.parse(response.body)['enabled']
  end

  # The roster-provider payload includes classlink only for holders of a v2
  # auth option (design Decision 6a). Visibility only — the rostering
  # endpoints reject no-v2 requesters independently (see ApiControllerTest).
  def rendered_dashboard_providers
    script = css_select('script[data-dashboard]').first
    JSON.parse(script['data-dashboard'])['providers']
  end

  test 'show: providers payload includes classlink for a v2 auth option holder' do
    teacher = create(:teacher, :with_classlink_authentication_option)
    create(
      :authentication_option,
      user: teacher,
      credential_type: AuthenticationOption::CLASSLINK,
      authentication_id: '2222|11111',
      version: AuthenticationOption::Classlink::VERSION[:v2]
    )
    sign_in teacher.reload

    get :show
    assert_response :success
    assert_includes rendered_dashboard_providers, 'classlink'
  end

  test 'show: providers payload omits classlink for a v1-only holder' do
    teacher = create(:teacher, :with_classlink_authentication_option)
    sign_in teacher

    get :show
    assert_response :success
    refute_includes rendered_dashboard_providers, 'classlink'
  end

  test 'show: the classlink filter leaves other providers untouched' do
    teacher = create(:teacher, :with_clever_authentication_option, :with_classlink_authentication_option)
    sign_in teacher

    get :show
    assert_response :success
    providers = rendered_dashboard_providers
    assert_includes providers, 'clever'
    refute_includes providers, 'classlink'
  end
end
