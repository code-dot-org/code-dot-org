require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  self.use_transactional_test_case = true
  setup_all do
  end

  test 'score_stage_for_section is restricted if signed out' do
    post :score_stage_for_section, params: {}
    assert_redirected_to_sign_in
  end
end
