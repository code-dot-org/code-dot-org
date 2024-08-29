require 'test_helper'

class AichatControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @authorized_teacher1 = create :authorized_teacher
    unit_group = create :unit_group, name: 'exploring-gen-ai-2024'
    section = create :section, user: @authorized_teacher1, unit_group: unit_group
    @authorized_student1 = create(:follower, section: section).student_user
    @authorized_teacher2 = create :authorized_teacher
    @authorized_student2 = create(:follower, section: section).student_user
    @level = create(:level, name: 'level1')
    @script = create(:script)
    @script_level = create(:script_level, script: @script, levels: [@level])
    valid_student1_chat_message1 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 1', status: 'ok', timestamp: Time.now.to_i}
    valid_student1_chat_message2 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 2', status: 'ok', timestamp: Time.now.to_i}
    valid_student2_chat_message = {role: 'user', chatMessageText: 'hello from authorized student 2', status: 'ok', timestamp: Time.now.to_i}
    valid_teacher1_chat_message = {role: 'user', chatMessageText: 'hello from authorized teacher 1', status: 'ok', timestamp: Time.now.to_i}
    # Store 4 chat_events in AichatEvents table: 2 for authorized student1, 1 for authorized teacher, 1 for authorized student2
    @student1_aichat_event1 = create(:aichat_event, user_id: @authorized_student1.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_student1_chat_message1.to_json)
    @student1_aichat_event2 = create(:aichat_event, user_id: @authorized_student1.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_student1_chat_message2.to_json)
    @teacher1_aichat_event = create(:aichat_event, user_id: @authorized_teacher1.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_teacher1_chat_message.to_json)
    @student2_aichat_event = create(:aichat_event, user_id: @authorized_student2.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_student2_chat_message.to_json)
    @default_model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}.stringify_keys
    @default_aichat_context = {
      currentLevelId: @level.id,
      scriptId: @script.id,
      channelId: "test"
    }
    @common_params = {
      storedMessages: [],
      aichatModelCustomizations: @default_model_customizations,
      aichatContext: @default_aichat_context
    }
    @profanity_violation_message = {role: 'user', chatMessageText: 'Damn you, robot', status: 'ok', timestamp: Time.now.to_i}
    @valid_params_chat_completion = @common_params.merge(newMessage: valid_student1_chat_message1)
    @profanity_violation_params = @common_params.merge(
      newMessage: @profanity_violation_message
    )
    @missing_stored_messages_params = @common_params.except(:storedMessages)
    @valid_params_student1_chat_history = {
      studentUserId: @authorized_student1.id,
      levelId: @level.id,
      scriptId: @script.id,
    }

    @valid_params_log_chat_event = {
      newChatEvent: valid_student1_chat_message1,
      aichatContext: @default_aichat_context
    }
    @missing_aichat_context_params = @valid_params_log_chat_event.except(:aichatContext)

    @project_id = 456
  end

  setup do
    @assistant_response = "This is an assistant response from Sagemaker"
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns(@assistant_response)
    @controller.stubs(:storage_decrypt_channel_id).returns([123, @project_id])
    Cdo::Throttle.stubs(:throttle).returns(false)
  end

  users = [:student, :teacher]
  [
    :log_chat_event,
    :student_chat_history,
    :start_chat_completion,
    [:chat_request, :get, {id: 1}]
  ].each do |action, method = :post, params = {}|
    users.each do |user|
      test_user_gets_response_for action,
        name: "#{user}_no_access_#{action}_test",
        user: user,
        method: method,
        params: params,
        response: :forbidden
    end
  end

  # start_chat_completion tests
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
    assert_equal request.model_customizations, @default_model_customizations.to_json
    assert_equal request.stored_messages, [].to_json
    assert_equal request.new_message, @valid_params_chat_completion[:newMessage].to_json
    assert_equal request.execution_status, SharedConstants::AI_REQUEST_EXECUTION_STATUS[:NOT_STARTED]
  end

  test 'start_chat_completion returns too many requests when request is throttled' do
    Cdo::Throttle.stubs(:throttle).returns(true)
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :too_many_requests
  end

  test 'can_request_aichat_chat_completion returns false when DCDO flag is set to `false`' do
    DCDO.stubs(:get).with('aichat_chat_completion', true).returns(false)
    assert_equal false, AichatSagemakerHelper.can_request_aichat_chat_completion?
  end

  test 'returns forbidden when DCDO flag is set to `false`' do
    AichatSagemakerHelper.stubs(:can_request_aichat_chat_completion?).returns(false)
    sign_in(@authorized_teacher1)
    post :start_chat_completion, params: @valid_params_chat_completion, as: :json
    assert_response :forbidden
  end

  test 'authorized teacher has access to log_chat_event test' do
    sign_in(@authorized_teacher1)
    post :log_chat_event, params: @valid_params_log_chat_event, as: :json
    assert_response :success
  end

  test 'student of authorized teacher has access to log_chat_event test' do
    sign_in(@authorized_student1)
    post :log_chat_event, params: @valid_params_log_chat_event, as: :json
    assert_response :success
  end

  test 'Bad request if missing param for log_chat_event' do
    sign_in(@authorized_teacher1)
    post :log_chat_event, params: @missing_aichat_context_params, as: :json
    assert_response :bad_request
  end

  test 'log_chat_event logs successfully to AichatEvents table' do
    sign_in(@authorized_student1)
    post :log_chat_event, params: @valid_params_log_chat_event, as: :json

    assert_response :success
    assert_equal json_response.keys, ['chat_event_id', 'chat_event']
    aichat_event_row = AichatEvent.find(json_response['chat_event_id'])
    stored_aichat_event = JSON.parse(aichat_event_row.aichat_event)
    assert_equal stored_aichat_event['timestamp'], @valid_params_log_chat_event[:newChatEvent][:timestamp]
  end

  test 'Bad request if required params are not included for student_chat_history' do
    sign_in(@authorized_teacher1)
    get :student_chat_history, params: {studentId: @authorized_student1.id}, as: :json
    assert_response :bad_request
  end

  test 'student of authorized teacher does not have access to student_chat_history test' do
    sign_in(@authorized_student1)
    get :student_chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :forbidden
  end

  test 'authorized teacher has access to student_chat_history if teacher of student' do
    sign_in(@authorized_teacher1)
    get :student_chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :success
  end

  test 'authorized teacher does not have access to student_chat_history if not teacher of student' do
    sign_in(@authorized_teacher2)
    get :student_chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :forbidden
  end

  test 'student_chat_history successfully returns list of student aichat_events' do
    sign_in(@authorized_teacher1)
    post :student_chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :success
    chat_events_array = json_response
    # 2 chat event stored for authorized student1 in AichatEvents table so 2 chat events returned
    # in ascending order.
    assert_equal chat_events_array.length, 2
    chat_event1_response = chat_events_array.first
    chat_event2_response = chat_events_array.last
    chat_event1_stored = JSON.parse(AichatEvent.find(@student1_aichat_event1.id).aichat_event)
    chat_event2_stored = JSON.parse(AichatEvent.find(@student1_aichat_event2.id).aichat_event)
    assert_equal chat_event1_response.keys, ['role', 'chatMessageText', 'status', 'timestamp']
    assert_equal chat_event1_response["chatMessageText"], chat_event1_stored["chatMessageText"]
    assert_equal chat_event2_response["chatMessageText"], chat_event2_stored["chatMessageText"]
  end

  # chat_request tests
  test 'GET chat_request returns not found if request does not exist' do
    sign_in(@authorized_student1)
    get :chat_request, params: {id: 1}, as: :json
    assert_response :not_found
  end

  test 'GET chat_request returns forbidden if user is not the requester' do
    sign_in(@authorized_teacher1)
    request = create(:aichat_request, user: @authorized_student1)
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
