require 'test_helper'

class AichatControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  GENAI_PILOT = "gen-ai-lab-v1"

  setup_all do
    @genai_pilot = create :pilot, name: GENAI_PILOT
    @genai_pilot_teacher = create :teacher, pilot_experiment: @genai_pilot.name
    pilot_section = create(:section, user: @genai_pilot_teacher)
    @genai_pilot_student = create(:follower, section: pilot_section).student_user

    @default_model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}
    @common_params = {
      storedMessages: [],
      aichatModelCustomizations: @default_model_customizations,
      aichatContext: {
        currentLevelId: 3,
        scriptId: 1,
        channelId: "test"
      }
    }
    valid_message = "hello"
    pii_violation_message = "my email is l.lovepadel@sports.edu"
    @profanity_violation_message = "Damn you, robot"
    @valid_params = @common_params.merge(newMessage: valid_message)
    @pii_violation_params = @common_params.merge(newMessage: pii_violation_message)
    @profanity_violation_params = @common_params.merge(newMessage: @profanity_violation_message)
    @missing_stored_messages_params = @common_params.except(:storedMessages)
  end

  setup do
    @assistant_response = "This is an assistant response from Sagemaker"
    AichatSagemakerHelper.stubs(:request_sagemaker_chat_completion).returns({status: 200, json: {body: {}}})
    AichatSagemakerHelper.stubs(:get_sagemaker_assistant_response).returns(@assistant_response)
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
  end

  test_user_gets_response_for :chat_completion,
    name: "student_no_access_test",
    user: :student,
    method: :post,
    response: :forbidden

  test_user_gets_response_for :chat_completion,
    name: "teacher_no_access_test",
    user: :teacher,
    method: :post,
    response: :forbidden

  test 'pilot teacher has access test' do
    sign_in(@genai_pilot_teacher)
    post :chat_completion, params: @valid_params, as: :json
    assert_response :success
  end

  test 'pilot student has access test' do
    sign_in(@genai_pilot_student)
    post :chat_completion, params: @valid_params, as: :json
    assert_response :success
  end

  test 'Bad request if required params are not included' do
    sign_in(@genai_pilot_teacher)
    post :chat_completion, params: {newMessage: "hello"}, as: :json
    assert_response :bad_request
  end

  test 'Bad request if storedMessages param is not included' do
    sign_in(@genai_pilot_teacher)
    post :chat_completion, params: @missing_stored_messages_params, as: :json
    assert_response :bad_request
  end

  test 'returns failure when chat message contains profanity' do
    sign_in(@genai_pilot_student)
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'))
    post :chat_completion, params: @profanity_violation_params, as: :json
    assert_equal ShareFiltering::FailureType::PROFANITY, json_response["status"]
    assert_equal "damn", json_response["flagged_content"]

    session = AichatSession.find(json_response['sessionId'])
    stored_message = JSON.parse(session.messages)[0]
    assert_equal stored_message, {
      role: 'user',
      content: @profanity_violation_message,
      status: 'profanity_violation'
    }.stringify_keys
  end

  # Post request with a messages param containing PII returns a failure
  test 'returns failure when chat message contains PII' do
    sign_in(@genai_pilot_student)
    ShareFiltering.stubs(:find_failure).returns(ShareFailure.new(ShareFiltering::FailureType::EMAIL, 'l.lovepadel@sports.edu'))
    post :chat_completion, params: @pii_violation_params, as: :json
    assert_equal ShareFiltering::FailureType::EMAIL, json_response["status"]
    assert_equal "l.lovepadel@sports.edu", json_response["flagged_content"]
  end

  test 'can_request_aichat_chat_completion returns false when DCDO flag is set to `false`' do
    DCDO.stubs(:get).with('aichat_chat_completion', true).returns(false)
    assert_equal false, AichatSagemakerHelper.can_request_aichat_chat_completion?
  end

  test 'returns forbidden when DCDO flag is set to `false`' do
    AichatSagemakerHelper.stubs(:can_request_aichat_chat_completion?).returns(false)
    sign_in(@genai_pilot_teacher)
    post :chat_completion, params: @valid_params, as: :json
    assert_response :forbidden
  end

  test 'creates new chat session when no session id provided' do
    sign_in(@genai_pilot_teacher)

    post :chat_completion, params: @valid_params, as: :json
    session = AichatSession.find(json_response['sessionId'])

    assert_equal @genai_pilot_teacher.id, session.user_id
    assert_equal @valid_params[:aichatContext][:currentLevelId], session.level_id
    assert_equal @valid_params[:aichatContext][:scriptId], session.script_id
    assert_equal 456, session.project_id
    assert_equal [
      {role: 'user', content: @valid_params[:newMessage], status: 'ok'}.stringify_keys,
      {role: 'assistant', content: @assistant_response, status: 'ok'}.stringify_keys
    ],
      JSON.parse(session.messages)
    assert_equal @valid_params[:aichatModelCustomizations].stringify_keys,
      JSON.parse(session.model_customizations)
  end

  test 'updates existing chat session when session id provided' do
    sign_in(@genai_pilot_teacher)

    post :chat_completion, params: @valid_params, as: :json
    session = AichatSession.find(json_response['sessionId'])

    post :chat_completion, params: @valid_params.merge(
      {
        sessionId: session.id,
        storedMessages: [
          {role: 'user', content: @valid_params[:newMessage], status: 'ok'}.stringify_keys,
          {role: 'assistant', content: @assistant_response, status: 'ok'}.stringify_keys
        ]
      }
    ),
      as: :json
    assert_equal session.id, json_response['sessionId']

    # Check that we added two new messages to the stored messages
    # (the new user and assistant messages).
    session.reload
    assert_equal 4, JSON.parse(session.messages).length
  end

  test 'creates new chat session when session id provided but session property does not match' do
    sign_in(@genai_pilot_teacher)

    post :chat_completion, params: @valid_params, as: :json
    session = AichatSession.find(json_response['sessionId'])

    post :chat_completion, params: @valid_params.merge(
      {
        sessionId: session.id,
        storedMessages: [
          {role: 'user', content: @valid_params[:newMessage], status: 'ok'}.stringify_keys,
          {role: 'assistant', content: @assistant_response, status: 'ok'}.stringify_keys
        ],
        aichatModelCustomizations: @default_model_customizations.merge(
          retrievalContexts: ["test", "mismatched retrieval context item"],
        ),
      }
    ),
      as: :json
    refute_equal session.id, json_response['sessionId']
  end
end
