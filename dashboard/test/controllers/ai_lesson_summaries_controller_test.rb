require 'test_helper'

class AiLessonSummariesControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @teacher = create(:teacher)
    @student = create(:student)
    @lesson = create(:lesson)
    @ai_lesson_summary = create(:ai_lesson_summary, user: @teacher, lesson: @lesson, lesson_summary: 'Test summary')
  end

  # *****
  # Authentication tests
  # *****

  test 'unauthenticated user cannot access show' do
    get :show, params: {user_id: @teacher.id, lesson_id: @lesson.id}, format: :json
    assert_response :unauthorized
  end

  test 'unauthenticated user cannot access create_or_update' do
    post :create_or_update, params: {user_id: @teacher.id, lesson_id: @lesson.id, lesson_summary: 'New summary'}, format: :json
    assert_response :unauthorized
  end

  test 'unauthenticated user cannot access update' do
    patch :update, params: {id: @ai_lesson_summary.id, ai_lesson_summary: {lesson_summary: 'Updated'}}, format: :json
    assert_response :unauthorized
  end

  test 'unauthenticated user cannot access destroy' do
    delete :destroy, params: {id: @ai_lesson_summary.id}, format: :json
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

  # *****
  # create_or_update action tests
  # *****

  test 'POST create_or_update creates new AI lesson summary when none exists' do
    sign_in @teacher
    new_lesson = create(:lesson)

    assert_difference 'AiLessonSummary.count', 1 do
      post :create_or_update, params: {
        user_id: @teacher.id,
        lesson_id: new_lesson.id,
        lesson_summary: 'New lesson summary'
      }, format: :json
    end

    assert_response :created
    response_data = json_response
    assert_equal @teacher.id, response_data['user_id']
    assert_equal new_lesson.id, response_data['lesson_id']
    assert_equal 'New lesson summary', response_data['lesson_summary']
  end

  test 'POST create_or_update updates existing AI lesson summary when one exists' do
    sign_in @teacher

    assert_no_difference 'AiLessonSummary.count' do
      post :create_or_update, params: {
        user_id: @teacher.id,
        lesson_id: @lesson.id,
        lesson_summary: 'Updated lesson summary'
      }, format: :json
    end

    assert_response :ok
    response_data = json_response
    assert_equal 'Updated lesson summary', response_data['lesson_summary']

    @ai_lesson_summary.reload
    assert_equal 'Updated lesson summary', @ai_lesson_summary.lesson_summary
  end

  test 'POST create_or_update returns validation errors for invalid data' do
    sign_in @teacher

    # Try to create with missing required fields
    post :create_or_update, params: {
      user_id: nil,
      lesson_id: @lesson.id,
      lesson_summary: 'Test summary'
    }, format: :json

    assert_response :unprocessable_entity
    assert json_response['errors'].present?
  end

  # *****
  # update action tests
  # *****

  test 'PATCH update successfully updates AI lesson summary for current user' do
    sign_in @teacher

    patch :update, params: {
      id: @ai_lesson_summary.id,
      ai_lesson_summary: {lesson_summary: 'Updated via patch'}
    }, format: :json

    assert_response :ok
    response_data = json_response
    assert_equal 'Updated via patch', response_data['lesson_summary']

    @ai_lesson_summary.reload
    assert_equal 'Updated via patch', @ai_lesson_summary.lesson_summary
  end

  test 'PATCH update returns validation errors for invalid data' do
    sign_in @teacher

    # Mock validation error
    AiLessonSummary.any_instance.stubs(:update).returns(false)
    AiLessonSummary.any_instance.stubs(:errors).returns(ActiveModel::Errors.new(AiLessonSummary.new).tap {|e| e.add(:lesson_summary, "can't be blank")})

    patch :update, params: {
      id: @ai_lesson_summary.id,
      ai_lesson_summary: {lesson_summary: ''}
    }, format: :json

    assert_response :unprocessable_entity
    assert json_response['errors'].present?
  end

  test 'PATCH update returns not found for non-existent AI lesson summary' do
    sign_in @teacher

    patch :update, params: {
      id: 999999,
      ai_lesson_summary: {lesson_summary: 'Updated'}
    }, format: :json

    assert_response :not_found
    assert_equal 'AI lesson summary not found', json_response['error']
  end

  test 'PATCH update prevents user from updating other users AI lesson summaries' do
    other_user = create(:teacher)
    other_summary = create(:ai_lesson_summary, user: other_user, lesson: @lesson)

    sign_in @teacher

    patch :update, params: {
      id: other_summary.id,
      ai_lesson_summary: {lesson_summary: 'Hacked summary'}
    }, format: :json

    assert_response :not_found
  end

  # *****
  # destroy action tests
  # *****

  test 'DELETE destroy successfully deletes AI lesson summary for current user' do
    sign_in @teacher

    assert_difference 'AiLessonSummary.count', -1 do
      delete :destroy, params: {id: @ai_lesson_summary.id}, format: :json
    end

    assert_response :no_content
  end

  test 'DELETE destroy returns not found for non-existent AI lesson summary' do
    sign_in @teacher

    delete :destroy, params: {id: 999999}, format: :json

    assert_response :not_found
    assert_equal 'AI lesson summary not found', json_response['error']
  end

  test 'DELETE destroy prevents user from deleting other users AI lesson summaries' do
    other_user = create(:teacher)
    other_summary = create(:ai_lesson_summary, user: other_user, lesson: @lesson)

    sign_in @teacher

    assert_no_difference 'AiLessonSummary.count' do
      delete :destroy, params: {id: other_summary.id}, format: :json
    end

    assert_response :not_found
  end

  # *****
  # Helper method tests
  # *****

  test 'ai_lesson_summary_params permits correct parameters' do
    sign_in @teacher
    @controller.params = ActionController::Parameters.new({
                                                            ai_lesson_summary: {
                                                              lesson_id: 1,
                                                              user_id: 2,
                                                              lesson_summary: 'Test summary',
                                                              unauthorized_param: 'should not be included'
                                                            }
                                                          }
)

    permitted_params = @controller.send(:ai_lesson_summary_params)

    assert_equal 1, permitted_params[:lesson_id]
    assert_equal 2, permitted_params[:user_id]
    assert_equal 'Test summary', permitted_params[:lesson_summary]
    assert_nil permitted_params[:unauthorized_param]
  end

  private def json_response
    JSON.parse(response.body)
  end
end
