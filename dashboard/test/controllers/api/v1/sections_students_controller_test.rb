require 'test_helper'

class Api::V1::SectionsStudentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @other_teacher = create(:teacher)
    @section = create(:section, user: @teacher, login_type: 'word')
    @student = create(:follower, section: @section).student_user
  end

  test 'logged out cannot view section students' do
    get :index, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'student cannot view section students' do
    sign_in @student
    get :index, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'non-owner cannot view section students' do
    sign_in @other_teacher
    get :index, params: {section_id: @section.id}
    assert_response :forbidden
  end

  test 'lists students' do
    sign_in @teacher

    get :index, params: {section_id: @section.id}
    assert_response :success
    expected_summary = [
      @student.summarize.merge(completed_levels_count: @student.user_levels.passing.count)
    ].to_json
    assert_equal expected_summary, @response.body
  end
end
