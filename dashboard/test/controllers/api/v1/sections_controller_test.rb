require 'test_helper'

class Api::V1::SectionsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)

    @word_section = create(:section, user: @teacher, login_type: 'word')
    @word_user = create(:follower, section: @word_section).student_user
  end

  test "join with invalid section code" do
    assert_raises(ActiveRecord::RecordNotFound) do
      post :join, params: {section_code: 'xxxxxx'}
    end
  end

  test "join with nobody signed in" do
    assert_raises(ActiveRecord::RecordInvalid) do
      post :join, params: {section_code: @word_section.code}
    end
  end

  test "join with valid section code" do
    student = create :student
    sign_in student
    post :join, params: {section_code: @word_section.code}
    assert_response :success
  end

  test "leave with invalid section code" do
    assert_raises(ActiveRecord::RecordNotFound) do
      post :leave, params: {section_code: 'xxxxxx'}
    end
  end

  test "leave with nobody signed in" do
    assert_raises(RuntimeError) do
      post :leave, params: {section_code: @word_section.code}
    end
  end

  test "leave with valid section code" do
    sign_in @word_user
    post :leave, params: {section_code: @word_section.code}
    assert_response :success
  end
end
