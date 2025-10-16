require 'test_helper'

class AichatRequestsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @authorized_teacher1 = create(:authorized_teacher)
    unit_group = create(:unit_group, name: 'exploring-gen-ai-2024')
    section = create(:section, user: @authorized_teacher1, unit_group: unit_group)
    @authorized_student1 = create(:follower, section: section).student_user
    @unauthorized_student = create(:student)
    @unauthorized_teacher = create(:teacher)

    @level = create(:level)
    @script = create(:script, :in_single_unit_course)

    @default_model_customizations = {clientType: 0, temperature: 0.5, retrievalContexts: ['test'], systemPrompt: 'test', selectedModelId: 'gpt-4o-mini'}.stringify_keys
    @default_aichat_context = {
      currentLevelId: @level.id,
      scriptId: @script.id,
      channelId: 'test',
      clientType: SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_CHAT_LAB]
    }

    @common_params = {
      storedMessages: [],
      modelParameters: @default_model_customizations,
      aichatContext: @default_aichat_context
    }

    valid_student1_chat_message1 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 1', status: 'ok', timestamp: Time.now.to_i}
    @valid_params_chat_completion = @common_params.merge(newMessage: valid_student1_chat_message1)

    @missing_stored_messages_params = @common_params.except(:storedMessages)
  end

  setup do
    @controller.stubs(:storage_decrypt_channel_id).returns([123, @project_id])
    DCDO.stubs(:get).with('block_ai_tutor_chat_completion', anything).returns(false)
    DCDO.stubs(:get).with('block_aichat_chat_completion', anything).returns(false)
    DCDO.stubs(:get).with('aichat_request_limit_per_min', anything).returns(AichatRequestsController::DEFAULT_REQUEST_LIMIT_PER_MIN)
    DCDO.stubs(:get).with('aichat_polling_interval_ms', anything).returns(AichatRequestsController::DEFAULT_POLLING_INTERVAL_MS)
    DCDO.stubs(:get).with('aichat_polling_backoff_rate', anything).returns(AichatRequestsController::DEFAULT_POLLING_BACKOFF_RATE)
    DCDO.stubs(:get).with('throttle_time_default', anything).returns(60)
  end

  # start_chat_completion tests
  test 'start_chat_completion returns forbidden if user is not signed in' do
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :forbidden
  end

  test 'teachers without access to chat completion get forbidden response' do
    sign_in(@unauthorized_teacher)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :forbidden
  end

  test 'students without access to chat completion get forbidden response' do
    sign_in(@unauthorized_student)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :forbidden
  end

  test 'unauthorized users can access start_chat_completion from ai tutor levels' do
    sign_in(@unauthorized_student)
    ai_tutor_client_type = SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR]
    params_with_ai_tutor_client_type = @valid_params_chat_completion.merge(aichatContext: @default_aichat_context.merge(clientType: ai_tutor_client_type))
    post :start_chat_completion, params: params_with_ai_tutor_client_type, as: :json
    assert_response :success
  end

  test 'ai_tutor DCDO flag blocks access to start_chat_completion from ai tutor levels' do
    sign_in(@unauthorized_student)
    DCDO.stubs(:get).with('block_ai_tutor_chat_completion', anything).returns(true)
    ai_tutor_client_type = SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR]
    params_with_ai_tutor_client_type = @valid_params_chat_completion.merge(aichatContext: @default_aichat_context.merge(clientType: ai_tutor_client_type))
    post :start_chat_completion, params: params_with_ai_tutor_client_type, as: :json
    assert_response :forbidden
  end

  test 'ai_tutor DCDO flag does not block start_chat_completion from ai chat levels' do
    sign_in(@authorized_teacher1)
    DCDO.stubs(:get).with('block_ai_tutor_chat_completion', anything).returns(true)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :success
  end

  test 'aichat DCDO flag does not block access to start_chat_completion from ai tutor levels' do
    sign_in(@unauthorized_student)
    DCDO.stubs(:get).with('block_aichat_chat_completion', anything).returns(true)
    ai_tutor_client_type = SharedConstants::AI_CHAT_CLIENT_TYPES[:AI_TUTOR]
    params_with_ai_tutor_client_type = @valid_params_chat_completion.merge(aichatContext: @default_aichat_context.merge(clientType: ai_tutor_client_type))
    post :start_chat_completion, params: params_with_ai_tutor_client_type, as: :json
    assert_response :success
  end

  test 'aichat DCDO flag blocks start_chat_completion from ai chat levels' do
    sign_in(@authorized_teacher1)
    DCDO.stubs(:get).with('block_aichat_chat_completion', anything).returns(true)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :forbidden
  end

  test 'authorized teacher has access to start_chat_completion test' do
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :success
  end

  test 'student of authorized teacher has access to start_chat_completion test' do
    sign_in(@authorized_student1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :success
  end

  test 'Bad request if required params are not included for start_chat_completion' do
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: {newMessage: "hello"}, as: :json
    assert_response :bad_request
  end

  test 'Bad request if storedMessages param is not included for start_chat_completion' do
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @missing_stored_messages_params, as: :json
    assert_response :bad_request
  end

  test 'start_chat_completion creates new request and returns correct parameters' do
    AichatRequestChatCompletionJob.stubs(:perform_later)

    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :success

    assert_equal json_response.keys, ['requestId', 'pollingIntervalMs', 'backoffRate']
    assert_equal json_response['pollingIntervalMs'], 1000
    assert_equal json_response['backoffRate'], 1.2

    # Verify the created AichatRequest
    request_id = json_response['requestId']
    request = AichatRequest.find(request_id)
    assert request.present?
    assert_equal request.user_id, @authorized_teacher1.id
    assert_equal request.level_id, @level.id
    assert_equal request.script_id, @script.id
    assert_equal request.project_id, @project_id
    assert_equal request.model_customizations, @default_model_customizations
    assert_equal request.stored_messages, []
    assert_equal request.new_message, @valid_params_chat_completion[:newMessage].stringify_keys
    assert_equal request.execution_status, SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED]
  end

  test 'start_chat_completion returns too many requests when request is throttled' do
    Cdo::Throttle.stubs(:throttle).with("aichat/requests/#{@authorized_teacher1.id}", 50, 60).returns(true)

    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :too_many_requests
  end

  test 'start_chat_completion returns too many requests when token count exceeds limit' do
    Cdo::Throttle.stubs(:throttle).with("aichat/requests/#{@authorized_teacher1.id}", 50, 60).returns(false)
    Cdo::Throttle.stubs(:throttled?).with("aichat/tokens/model/gpt-4o-mini/user/#{@authorized_teacher1.id}").returns(true)

    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :too_many_requests
  end

  # Note that this is only required for clients with stale JavaScript code using the
  # old parameter name. This should be removed in the future.
  test 'start_chat_completion reassigns aichatModelCustomizations param to modelParameters' do
    AichatRequestChatCompletionJob.stubs(:perform_later)
    sign_in(@authorized_teacher1)
    params_with_aichat_customizations = @valid_params_chat_completion.merge(aichatModelCustomizations: @default_model_customizations)
    post :start_chat_completion, params: params_with_aichat_customizations, as: :json
    assert_response :success
    request_id = json_response['requestId']
    request = AichatRequest.find(request_id)
    assert_equal request.model_customizations, @default_model_customizations
  end

  # chat_request tests
  test 'GET chat_request returns not found if request does not exist' do
    sign_in(@authorized_student1)
    get :chat_request, params: {id: 100}, as: :json
    assert_response :not_found
  end

  test 'GET chat_request returns forbidden if user is not the requester' do
    sign_in(@authorized_teacher1)
    request = create(:aichat_request, user: @authorized_student1)
    get :chat_request, params: {id: request.id}, as: :json
    assert_response :forbidden
  end

  test 'GET chat_request returns forbidden if user is not signed in' do
    request = create(:aichat_request, user: @authorized_teacher1)
    get :chat_request, params: {id: request.id}, as: :json
    assert_response :forbidden
  end

  test 'GET chat_request returns request status and response' do
    response = "AI model response"
    execution_status = SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS]

    sign_in(@authorized_teacher1)
    request = create(:aichat_request, user: @authorized_teacher1, response: response, execution_status: execution_status)
    get :chat_request, params: {id: request.id}, as: :json

    assert_response :success
    assert_equal json_response.keys, ['executionStatus', 'response']
    assert_equal json_response['executionStatus'], execution_status
    assert_equal json_response['response'], response
  end
end
