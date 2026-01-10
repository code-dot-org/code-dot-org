require 'test_helper'

class AiLessonSummariesControllerTest < ActionController::TestCase
  setup_all do
    @teacher = create(:teacher)
    @student = create(:student)

    @unit = create(:script)
    lesson_group = create(:lesson_group, script: @unit)
    @lesson_with_plan = create(:lesson, has_lesson_plan: true, lesson_group: lesson_group)
    @lesson_without_plan = create(:lesson, lesson_group: lesson_group)
    @lesson_with_plan_2 = create(:lesson, has_lesson_plan: true, lesson_group: lesson_group)
    @lesson_without_plan_2 = create(:lesson, lesson_group: lesson_group)
    @ai_lesson_summary = AiLessonSummary.create(user_id: @teacher.id, lesson_id: @lesson_with_plan.id, lesson_summary: 'Test summary', script: "Test script with\n\nnewlines and \"quotes\"")
  end

  # *****
  # Authentication tests
  # *****

  test 'unauthenticated user cannot access show' do
    get :show, params: {lesson_id: @lesson_with_plan.id}, format: :json
    assert_response :unauthorized
  end

  test 'unauthenticated user cannot access perform_ai_lesson_summaries_by_unit' do
    post :perform_ai_lesson_summaries_by_unit, params: {unit_id: @unit.id}, format: :json
    assert_response :unauthorized
  end

  test 'unauthenticated user cannot access perform_ai_lesson_summary_by_lesson' do
    post :perform_ai_lesson_summary_by_lesson, params: {lesson_id: @lesson_with_plan.id, unit_id: @unit.id}, format: :json
    assert_response :unauthorized
  end

  # *****
  # show action tests
  # *****

  test 'show returns AI lesson summary with brief text summary when found for current user' do
    sign_in @teacher
    get :show, params: {lesson_id: @lesson_with_plan.id}, format: :json

    assert_response :success
    response_data = json_response
    assert_equal @ai_lesson_summary.id, response_data['id']
    assert_equal 'Test summary', response_data['lesson_summary']
    assert_equal @teacher.id, response_data['user_id']
    assert_equal @lesson_with_plan.id, response_data['lesson_id']
    assert response_data['lesson'].present?, 'Should include lesson data'
  end

  test 'show returns not found when AI lesson summary with brief text summary does not exist' do
    sign_in @teacher
    non_existent_lesson = create(:lesson)
    get :show, params: {lesson_id: non_existent_lesson.id}, format: :json

    assert_response :not_found
    assert_equal 'AI brief text lesson summary not found', json_response['error']
  end

  test 'show returns not found when AI lesson summary with brief text summary belongs to different user' do
    other_teacher = create(:teacher)
    other_lesson = create(:lesson, has_lesson_plan: true)
    AiLessonSummary.create(user_id: other_teacher.id, lesson_id: other_lesson.id, lesson_summary: "Should not display")

    sign_in @teacher
    get :show, params: {lesson_id: other_lesson.id}, format: :json

    assert_response :not_found
    assert_equal 'AI brief text lesson summary not found', json_response['error']
  end

  test 'show uses current_user.id instead of params user_id for security' do
    sign_in @teacher

    # Try to access with a different user_id in params (should be ignored)
    get :show, params: {lesson_id: @lesson_with_plan.id, user_id: @student.id}, format: :json

    assert_response :success
    response_data = json_response
    # Should return the teacher's summary, not look for student's
    assert_equal @teacher.id, response_data['user_id']
  end

  # *****
  # ai_lesson_summary_podcast_script action tests
  # *****

  test 'ai_lesson_summary_podcast_script returns parsed AI lesson summary with podcast script when found for current user' do
    sign_in @teacher
    get :ai_lesson_summary_podcast_script, params: {lesson_id: @lesson_with_plan.id}, format: :json

    assert_response :success
    response_data = json_response
    assert_equal response_data['podcast_script'], "Test script with newlines and 'quotes'"
  end

  test 'ai_lesson_summary_podcast_script returns not found when AI lesson summary with podcast script does not exist' do
    sign_in @teacher
    non_existent_lesson = create(:lesson)
    get :ai_lesson_summary_podcast_script, params: {lesson_id: non_existent_lesson.id}, format: :json

    assert_response :not_found
    assert_equal json_response['error'], 'AI lesson summary podcast script not found'
  end

  test 'ai_lesson_summary_podcast_script returns not found when AI lesson summary with podcast script belongs to different user' do
    other_teacher = create(:teacher)
    other_lesson = create(:lesson, has_lesson_plan: true)
    AiLessonSummary.create(user_id: other_teacher.id, lesson_id: other_lesson.id, lesson_summary: "Should not display")

    sign_in @teacher
    get :ai_lesson_summary_podcast_script, params: {lesson_id: other_lesson.id}, format: :json

    assert_response :not_found
    assert_equal json_response['error'], 'AI lesson summary podcast script not found'
  end

  # *****
  # perform_ai_lesson_summaries_by_unit action tests
  # *****

  test 'perform_ai_lesson_summaries_by_unit enqueues job for lessons with lesson plans' do
    sign_in @teacher

    # Mock the job to verify it gets called with correct parameters
    expected_request = {
      user_id: @teacher.id,
      lesson_ids: [@lesson_with_plan.id, @lesson_with_plan_2.id],
      unit_id: @unit.id
    }

    AiLessonSummariesJob.expects(:perform_later).with(request: expected_request)

    post :perform_ai_lesson_summaries_by_unit, params: {unit_id: @unit.id}, format: :json

    assert_response :success
  end

  test 'perform_ai_lesson_summaries_by_unit only includes lessons with lesson plans' do
    sign_in @teacher

    expected_request = {
      user_id: @teacher.id,
      lesson_ids: [@lesson_with_plan.id, @lesson_with_plan_2.id],
      unit_id: @unit.id
    }

    AiLessonSummariesJob.expects(:perform_later).with(request: expected_request)

    post :perform_ai_lesson_summaries_by_unit, params: {unit_id: @unit.id}, format: :json

    assert_response :success
  end

  test 'perform_ai_lesson_summaries_by_unit handles unit with no lessons with lesson plans' do
    sign_in @teacher
    unit_without_plans = create(:script)
    lesson_group_without_plans = create(:lesson_group, script: unit_without_plans)
    create(:lesson, lesson_group: lesson_group_without_plans)
    create(:lesson, lesson_group: lesson_group_without_plans)

    expected_request = {
      user_id: @teacher.id,
      lesson_ids: [],
      unit_id: unit_without_plans.id
    }

    AiLessonSummariesJob.expects(:perform_later).with(request: expected_request)

    post :perform_ai_lesson_summaries_by_unit, params: {unit_id: unit_without_plans.id}, format: :json

    assert_response :success
  end

  test 'perform_ai_lesson_summaries_by_unit handles non-existent unit' do
    sign_in @teacher

    assert_raises(ActiveRecord::RecordNotFound) do
      post :perform_ai_lesson_summaries_by_unit, params: {unit_id: 999999}, format: :json
    end
  end

  # *****
  # perform_ai_lesson_summary_by_lesson action tests
  # *****

  test 'perform_ai_lesson_summary_by_lesson enqueues job for lesson with lesson plan' do
    sign_in @teacher

    expected_request = {
      user_id: @teacher.id,
      lesson_ids: [@lesson_with_plan.id],
      unit_id: @unit.id
    }

    AiLessonSummariesJob.expects(:perform_later).with(request: expected_request)

    post :perform_ai_lesson_summary_by_lesson, params: {lesson_id: @lesson_with_plan.id, unit_id: @unit.id}, format: :json

    assert_response :success
  end

  test 'perform_ai_lesson_summary_by_lesson does not enqueue job for lesson without lesson plan' do
    sign_in @teacher

    # Should not call perform_later when lesson has no lesson plan
    AiLessonSummariesJob.expects(:perform_later).never

    post :perform_ai_lesson_summary_by_lesson, params: {lesson_id: @lesson_without_plan.id, unit_id: @unit.id}, format: :json

    assert_response :success
  end

  test 'perform_ai_lesson_summary_by_lesson handles non-existent lesson' do
    sign_in @teacher

    assert_raises(ActiveRecord::RecordNotFound) do
      post :perform_ai_lesson_summary_by_lesson, params: {lesson_id: 999999, unit_id: @unit.id}, format: :json
    end
  end

  test 'perform_ai_lesson_summary_by_lesson uses current_user.id in request' do
    sign_in @teacher

    expected_request = {
      user_id: @teacher.id,
      lesson_ids: [@lesson_with_plan.id],
      unit_id: @unit.id
    }

    AiLessonSummariesJob.expects(:perform_later).with(request: expected_request)

    post :perform_ai_lesson_summary_by_lesson, params: {lesson_id: @lesson_with_plan.id, unit_id: @unit.id}, format: :json
  end

  # *****
  # Helper method tests
  # *****

  test 'ai_lesson_summary_params permits correct parameters' do
    sign_in @teacher
    @controller.params = ActionController::Parameters.new({
                                                            lesson_id: 1,
      unit_id: 2,
      lesson_summary: 'Test summary',
      unauthorized_param: 'should not be included'
                                                          }
)

    permitted_params = @controller.send(:ai_lesson_summary_params)

    assert_equal 1, permitted_params[:lesson_id]
    assert_equal 2, permitted_params[:unit_id]
    assert_equal 'Test summary', permitted_params[:lesson_summary]
    assert_nil permitted_params[:unauthorized_param]
  end

  test 'ai_lesson_summary_params handles underscore transformation' do
    sign_in @teacher
    @controller.params = ActionController::Parameters.new({
                                                            'lessonId' => 1,
      'unitId' => 2,
      'lessonSummary' => 'Test summary'
                                                          }
)

    permitted_params = @controller.send(:ai_lesson_summary_params)

    assert_equal 1, permitted_params[:lesson_id]
    assert_equal 2, permitted_params[:unit_id]
    assert_equal 'Test summary', permitted_params[:lesson_summary]
  end

  # *****
  # Security tests
  # *****

  test 'show action scopes queries to current_user preventing access to other users data' do
    other_teacher = create(:teacher)
    other_teacher_lesson = create(:lesson, has_lesson_plan: true)
    AiLessonSummary.create(user_id: other_teacher.id, lesson_id: other_teacher_lesson.id, lesson_summary: "Don't show")

    sign_in @teacher

    # The query should use current_user.id, so it won't find the other teacher's summary
    get :show, params: {lesson_id: other_teacher_lesson.id}, format: :json

    assert_response :not_found
  end

  test 'perform methods use current_user.id preventing job execution for other users' do
    sign_in @teacher

    # Even if someone tries to pass a different user_id in params,
    # the job should be enqueued with current_user.id
    expected_request = {
      user_id: @teacher.id,
      lesson_ids: [@lesson_with_plan.id],
      unit_id: @unit.id
    }

    AiLessonSummariesJob.expects(:perform_later).with(request: expected_request)

    post :perform_ai_lesson_summary_by_lesson, params: {
      lesson_id: @lesson_with_plan.id,
      user_id: @student.id,  # This should be ignored
      unit_id: @unit.id
    }, format: :json
  end

  test 'unit with mixed lesson plan availability correctly filters lessons' do
    sign_in @teacher

    expected_lesson_ids = [@lesson_with_plan.id, @lesson_with_plan_2.id].sort

    AiLessonSummariesJob.expects(:perform_later) do |args|
      actual_lesson_ids = args[:request][:lesson_ids].sort
      actual_lesson_ids == expected_lesson_ids
    end

    post :perform_ai_lesson_summaries_by_unit, params: {unit_id: @unit.id}, format: :json

    assert_response :success
  end

  private def json_response
    JSON.parse(response.body)
  end
end
