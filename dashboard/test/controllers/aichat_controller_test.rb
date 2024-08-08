require 'test_helper'

class AichatControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true
  GENAI_PILOT = "gen-ai-lab-v1"

  setup_all do
    @genai_pilot = create :pilot, name: GENAI_PILOT
    @genai_pilot_teacher = create :teacher, pilot_experiment: @genai_pilot.name
    pilot_section = create(:section, user: @genai_pilot_teacher)
    @genai_pilot_student = create(:follower, section: pilot_section).student_user
    @genai_pilot_teacher2 = create :teacher, pilot_experiment: @genai_pilot.name
    @level = FactoryBot.create(:level, name: 'level1')
    @script = FactoryBot.create(:script)
    @script_level = FactoryBot.create(:script_level, script: @script, levels: [@level])

    @default_model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}.stringify_keys
    @common_params = {
      storedMessages: [],
      aichatModelCustomizations: @default_model_customizations,
      aichatContext: {
        currentLevelId: @level.id,
        scriptId: @script.id,
        channelId: "test"
      }
    }
    valid_message = {role: 'user', chatMessageText: 'hello', status: 'unknown', timestamp: Time.now.to_i}
    @profanity_violation_message = {role: 'user', chatMessageText: 'Damn you, robot', status: 'unknown', timestamp: Time.now.to_i}
    @valid_params = @common_params.merge(newMessage: valid_message)
    @profanity_violation_params = @common_params.merge(
      newMessage: @profanity_violation_message
    )
    @missing_stored_messages_params = @common_params.except(:storedMessages)
    @valid_params_student_chat_history = {
      studentUserId: @genai_pilot_student.id,
      currentLevelId: @level.id,
      scriptId: @script.id,
    }
  end

  setup do
    @assistant_response = "This is an assistant response from Sagemaker"
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

  test 'returns user profanity status when chat message contains profanity' do
    sign_in(@genai_pilot_student)
    ShareFiltering.stubs(:find_profanity_failure).returns(ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn'))
    post :chat_completion, params: @profanity_violation_params, as: :json

    assert_response :success
    assert_equal "damn", json_response["flagged_content"]
    assert_equal json_response.keys, ['messages', 'flagged_content', 'session_id']

    session = AichatSession.find(json_response['session_id'])
    stored_message = JSON.parse(session.messages)[0]
    assert_equal stored_message,
      @profanity_violation_message.merge(
        status: SharedConstants::AI_INTERACTION_STATUS[:PROFANITY_VIOLATION]
      ).stringify_keys
  end

  test 'filters previous profanity when sending previous messages to Sagemaker but still logs' do
    ok_message = {status: 'ok', role: 'user', chatMessageText: 'another message'}.stringify_keys
    params = @valid_params.merge(
      storedMessages: [
        {status: 'profanity_violation', role: 'user', chatMessageText: 'damn'},
        ok_message
      ]
    )

    # Note that second expected argument filters out the previous profane message
    # in what we send to Sagemaker.
    AichatSagemakerHelper.expects(:get_sagemaker_assistant_response).with(params[:aichatModelCustomizations], [ok_message], params[:newMessage].stringify_keys).once

    sign_in(@genai_pilot_student)
    post :chat_completion, params: params, as: :json
    assert_response :success

    session = AichatSession.find(json_response['session_id'])
    assert_equal 4, JSON.parse(session.messages).length
    assert_equal 1, (JSON.parse(session.messages).count {|message| message["status"] == 'profanity_violation'})
  end

  test 'returns model profanity status when model response contains profanity' do
    sign_in(@genai_pilot_student)
    ShareFiltering.stubs(:find_profanity_failure).returns(
      nil,
      ShareFailure.new(ShareFiltering::FailureType::PROFANITY, 'damn')
    )
    post :chat_completion, params: @valid_params, as: :json

    assert_response :success
    assert_equal json_response.keys, ['messages', 'session_id']

    session = AichatSession.find(json_response['session_id'])
    assert_equal 2, JSON.parse(session.messages).length
    assert_equal JSON.parse(session.messages),
      [
        @valid_params[:newMessage].merge(
          status: SharedConstants::AI_INTERACTION_STATUS[:ERROR]
        ),
        {
          role: "assistant",
          status: SharedConstants::AI_INTERACTION_STATUS[:ERROR],
          chatMessageText: '[redacted - model generated profanity]',
        }
      ].map(&:stringify_keys)
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
    session = AichatSession.find(json_response['session_id'])

    assert_equal @genai_pilot_teacher.id, session.user_id
    assert_equal @valid_params[:aichatContext][:currentLevelId], session.level_id
    assert_equal @valid_params[:aichatContext][:scriptId], session.script_id
    assert_equal 456, session.project_id
    assert_equal [
      @valid_params[:newMessage].merge(status: 'ok').stringify_keys,
      {role: 'assistant', chatMessageText: @assistant_response, status: 'ok'}.stringify_keys
    ],
      JSON.parse(session.messages)
    assert_equal @valid_params[:aichatModelCustomizations].stringify_keys,
      JSON.parse(session.model_customizations)
  end

  test 'updates existing chat session when session id provided' do
    sign_in(@genai_pilot_teacher)

    post :chat_completion, params: @valid_params, as: :json
    session = AichatSession.find(json_response['session_id'])

    post :chat_completion, params: @valid_params.merge(
      {
        sessionId: session.id,
        storedMessages: [
          @valid_params[:newMessage].merge(status: 'ok').stringify_keys,
          {role: 'assistant', chatMessageText: @assistant_response, status: 'ok'}.stringify_keys
        ]
      }
    ),
      as: :json
    assert_equal session.id, json_response['session_id']

    # Check that we added two new messages to the stored messages
    # (the new user and assistant messages).
    session.reload
    assert_equal 4, JSON.parse(session.messages).length
  end

  test 'creates new chat session when session id provided but session property does not match' do
    sign_in(@genai_pilot_teacher)

    post :chat_completion, params: @valid_params, as: :json
    session = AichatSession.find(json_response['session_id'])

    post :chat_completion, params: @valid_params.merge(
      {
        sessionId: session.id,
        storedMessages: [
          @valid_params[:newMessage].merge(status: 'ok').stringify_keys,
          {role: 'assistant', chatMessageText: @assistant_response, status: 'ok'}.stringify_keys
        ],
        aichatModelCustomizations: @default_model_customizations.merge(
          retrievalContexts: ["test", "mismatched retrieval context item"],
        ),
      }
    ),
      as: :json
    refute_equal session.id, json_response['session_id']
  end

  test 'updates existing chat session when session id provided and a message field outside of chatMessageText, role, and status do not match' do
    sign_in(@genai_pilot_teacher)

    post :chat_completion, params: @valid_params, as: :json
    session = AichatSession.find(json_response['session_id'])

    post :chat_completion, params: @valid_params.merge(
      {
        sessionId: session.id,
        storedMessages: [
          @valid_params[:newMessage].merge(status: 'ok').stringify_keys,
          {role: 'assistant', chatMessageText: @assistant_response, status: 'ok', timestamp: Time.now.to_i}.stringify_keys
        ],
        aichatModelCustomizations: @default_model_customizations
      }
    ),
      as: :json
    assert_equal session.id, json_response['session_id']
  end

  test 'Bad request if required params are not included for student_chat_history' do
    sign_in(@genai_pilot_teacher)
    get :chat_completion, params: {studentId: @genai_pilot_student.id}, as: :json
    assert_response :bad_request
  end

  test 'pilot student does not have access to student_chat_history test' do
    sign_in(@genai_pilot_student)
    get :student_chat_history, params: @valid_params_student_chat_history, as: :json
    assert_response :forbidden
  end

  test 'pilot teacher has access to student_chat_history if teacher of student' do
    sign_in(@genai_pilot_teacher)
    get :student_chat_history, params: @valid_params_student_chat_history, as: :json
    assert_response :success
  end

  test 'pilot teacher does not have access to student_chat_history if not teacher of student' do
    sign_in(@genai_pilot_teacher2)
    get :student_chat_history, params: @valid_params_student_chat_history, as: :json
    assert_response :forbidden
  end
end
