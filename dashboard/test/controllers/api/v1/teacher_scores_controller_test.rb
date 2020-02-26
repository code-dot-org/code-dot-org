require 'test_helper'

class Api::V1::TeacherFeedbacksControllerTest < ActionDispatch::IntegrationTest
  self.use_transactional_test_case = true
  setup_all do
    @teacher = create :teacher
    @student = create :student
    @section = create :section, user: @teacher
    @stage = create :stage
  end

  test 'score_stage_for_section is restricted if signed out' do
    post '/dashboardapi/v1/teacher_scores', params: {
      section_id: @section.id, stage_id: @stage.id, score: 100
    }
    assert_response 302
  end

  test 'score_stage_for_section is restricted if student' do
    sign_in @student
    post '/dashboardapi/v1/teacher_scores', params: {
      section_id: @section.id, stage_id: @stage.id, score: 100
    }
    assert_response :forbidden
  end

  test 'score_stage_for_section succeeds for teacher' do
    sign_in @teacher
    post '/dashboardapi/v1/teacher_scores', params: {
      section_id: @section.id, stage_id: @stage.id, score: 100
    }
    assert_response :no_content
  end
end
