require 'test_helper'

class TeacherDashboardControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @section_owner = create :teacher
    @sections = create_list :section, 3, user: @section_owner
    @section = @sections.first
  end

  test 'index: returns forbidden if no logged in user' do
    get :show, params: {section_id: @section.id}
    assert_redirected_to_sign_in
  end

  test 'index: returns forbidden if logged in user is not a teacher' do
    sign_in create(:student)
    get :show, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'index: returns forbidden if requested section does not belong to teacher' do
    sign_in @section_owner
    other_teacher_section = create :section
    get :show, params: {section_id: other_teacher_section.id}
    assert_response :forbidden
  end

  test 'index: returns success if requested section belongs to the section owner' do
    sign_in @section_owner
    section = create :section, user: @section_owner
    get :show, params: {section_id: section.id}
    assert_response :success
  end

  test 'index: returns success if requested section is an instructed section for a coteacher' do
    cotaught_section = create(:section, user: @section_owner, login_type: 'word')
    other_teacher = create :teacher
    create(:section_instructor, instructor: other_teacher, section: cotaught_section, status: :active)

    sign_in other_teacher
    get :show, params: {section_id: cotaught_section.id}
    assert_response :success
  end

  test 'redirect_to_newest_section: redirects to support URL if no sections instructed' do
    other_teacher = create(:teacher)
    sign_in other_teacher

    get :redirect_to_newest_section

    assert_redirected_to 'https://support.code.org/hc/en-us/articles/25195525766669-Getting-Started-New-Progress-View'
  end

  test 'redirect_to_newest_section: redirects to newest section progress page if sections instructed' do
    sign_in @section_owner

    get :redirect_to_newest_section

    assert_redirected_to "/teacher_dashboard/sections/#{@section.id}/progress?view=v2"
  end
end
