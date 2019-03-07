require 'test_helper'

class TeacherDashboardControllerTest < ActionController::TestCase
  setup_all do
    @teacher = create :teacher
    @sections = create_list :section, 3, user: @teacher
    @section = @sections.first
  end

  test 'index: returns forbidden if no logged in user' do
    get :show, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'index: returns forbidden if logged in user is not a teacher' do
    sign_in create(:student)
    get :show, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'index: returns forbidden if requested section does not belong to teacher' do
    sign_in @teacher
    other_teacher_section = create :section
    get :show, params: {section_id: other_teacher_section.id}
    assert_response :forbidden
  end
end
