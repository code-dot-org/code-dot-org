require 'test_helper'

class Api::V1::SectionsStudentsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @other_teacher = create(:teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_user_1 = create(:follower, section: @word_section).student_user
  end

  test 'logged out cannot view section students' do
    get :index, params: {section_id: @word_section.id}
    assert_response :forbidden
  end

  test 'student cannot view section students' do
    sign_in @word_user_1
    get :index, params: {section_id: @word_section.id}
    assert_response :forbidden
  end

  test 'non-owner cannot view section students' do
    sign_in @other_teacher
    get :index, params: {section_id: @word_section.id}
    assert_response :forbidden
  end

  test 'lists students' do
    sign_in @teacher

    get :index, params: {section_id: @word_section.id}
    assert_response :success
    expected_summary = [
      @word_user_1.summarize.merge(completed_levels_count: @word_user_1.user_levels.passing.count)
    ].to_json
    assert_equal expected_summary, @response.body
  end
end
