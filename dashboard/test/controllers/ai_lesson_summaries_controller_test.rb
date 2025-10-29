require 'test_helper'

class AiLessonSummariesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @student = create(:student)
    @lesson = create(:lesson)
    @ai_lesson_summary = AiLessonSummary.create!(user_id: @teacher.id, lesson_id: @lesson.id, lesson_summary: 'Test summary')
  end

  # *****
  # Authentication tests
  # *****

  test 'unauthenticated user cannot access show' do
    get :show, params: {user_id: @teacher.id, lesson_id: @lesson.id}, format: :json
    assert_response :unauthorized
  end

  # *****
  # show action tests
  # *****

  test 'GET show returns AI lesson summary when found' do
    sign_in @teacher
    get :show, params: {user_id: @teacher.id, lesson_id: @lesson.id}, format: :json

    assert_response :success
    response_data = json_response
    assert_equal @ai_lesson_summary.id, response_data['id']
    assert_equal 'Test summary', response_data['lesson_summary']
    assert response_data['lesson'].present?, 'Should include lesson data'
  end

  test 'GET show returns not found when AI lesson summary does not exist' do
    sign_in @teacher
    non_existent_lesson = create(:lesson)
    get :show, params: {user_id: @teacher.id, lesson_id: non_existent_lesson.id}, format: :json

    assert_response :not_found
    assert_equal 'AI lesson summary not found', json_response['error']
  end

  private def json_response
    JSON.parse(response.body)
  end
end
