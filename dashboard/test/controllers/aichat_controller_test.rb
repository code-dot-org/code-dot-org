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
    @level = create(:level)
    @script = create(:script)
    @script_level = create(:script_level, script: @script, levels: [@level])
    valid_student1_chat_message1 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 1', status: 'ok', timestamp: Time.now.to_i}
    valid_student1_chat_message2 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 2', status: 'ok', timestamp: Time.now.to_i}
    valid_student2_chat_message = {role: 'user', chatMessageText: 'hello from authorized student 2', status: 'ok', timestamp: Time.now.to_i}
    valid_teacher1_chat_message = {role: 'user', chatMessageText: 'hello from authorized teacher 1', status: 'ok', timestamp: Time.now.to_i}
    # Store 4 chat_events in AichatEvents table: 2 for authorized student1, 1 for authorized teacher, 1 for authorized student2
    @student1_aichat_event1 = create(:aichat_event, user_id: @authorized_student1.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_student1_chat_message1)
    @student1_aichat_event2 = create(:aichat_event, user_id: @authorized_student1.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_student1_chat_message2)
    @teacher1_aichat_event = create(:aichat_event, user_id: @authorized_teacher1.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_teacher1_chat_message)
    @student2_aichat_event = create(:aichat_event, user_id: @authorized_student2.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_student2_chat_message)
    @default_model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}.stringify_keys
    @student1_aichat_request = create(:aichat_request, user_id: @authorized_student1.id, model_customizations: @default_model_customizations.to_json, stored_messages: [].to_json, new_message: valid_student1_chat_message1.to_json, execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS])
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
    :find_toxicity,
    :submit_teacher_feedback,
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

  # log_chat_event tests
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
    event_id = json_response['id']
    assert_equal json_response, @valid_params_log_chat_event[:newChatEvent].merge(id: event_id).stringify_keys
    aichat_event_row = AichatEvent.find(event_id)
    stored_aichat_event = aichat_event_row.aichat_event
    assert_equal stored_aichat_event['timestamp'], @valid_params_log_chat_event[:newChatEvent][:timestamp]
  end

  test 'log_chat_event logs requestId successfully to AichatEvents table' do
    sign_in(@authorized_student1)

    # need a valid requestId for foreign key constraint
    request_id = @student1_aichat_request.id
    params = @valid_params_log_chat_event.merge(newChatEvent: @valid_params_log_chat_event[:newChatEvent].merge(requestId: request_id))

    post :log_chat_event, params: params, as: :json

    assert_response :success
    event_id = json_response['id']
    assert_equal json_response, params[:newChatEvent].merge(id: event_id).stringify_keys
    aichat_event_row = AichatEvent.find(event_id)
    stored_aichat_event = aichat_event_row.aichat_event
    assert_equal request_id, stored_aichat_event['requestId']
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
    chat_event1_stored = AichatEvent.find(@student1_aichat_event1.id).aichat_event
    chat_event2_stored = AichatEvent.find(@student1_aichat_event2.id).aichat_event
    assert_equal chat_event1_response.keys.sort, %w(id role chatMessageText status timestamp).sort

    assert_equal chat_event1_response["chatMessageText"], chat_event1_stored["chatMessageText"]
    assert_equal chat_event2_response["chatMessageText"], chat_event2_stored["chatMessageText"]
  end

  # user_has_access tests
  test 'signed out user does not have access to user_has_access test' do
    get :user_has_access, format: :json
    assert_response :forbidden
  end

  test 'GET user_has_access returns false for unauthorized teacher' do
    sign_in(create(:teacher))
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], false
  end

  test 'GET user_has_access returns true for authorized teacher' do
    sign_in(@authorized_teacher1)
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], true
  end

  test 'GET user_has_access returns false for unauthorized student' do
    sign_in(create(:student))
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], false
  end

  test 'GET user_has_access returns true for student of authorized teacher' do
    sign_in(@authorized_student1)
    get :user_has_access, format: :json
    assert_response :success
    assert_equal json_response['userHasAccess'], true
  end

  test 'find_toxicity returns toxicity if detected in system prompt' do
    sign_in(@authorized_student1)
    system_prompt = 'hello system prompt'
    locale = 'en'
    toxicity_response = {text: system_prompt, blocked_by: 'comprehend', details: {}}
    AichatSafetyHelper.expects(:find_toxicity).with('user', system_prompt, locale).returns(toxicity_response)

    expected_response = {
      flaggedFields: [{field: 'systemPrompt', toxicity: toxicity_response.camelize_keys}]
    }.deep_stringify_keys

    post :find_toxicity, params: {systemPrompt: system_prompt, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end

  test 'find_toxicity returns toxicity if detected in retrieval context' do
    sign_in(@authorized_student1)
    retrieval_contexts = ['retrieval1', 'retrieval2']
    locale = 'en'
    toxicity_response = {text: retrieval_contexts.join(' '), blocked_by: 'comprehend', details: {}}
    AichatSafetyHelper.expects(:find_toxicity).with('user', retrieval_contexts.join(' '), locale).returns(toxicity_response)

    expected_response = {
      flaggedFields: [{field: 'retrievalContexts', toxicity: toxicity_response.camelize_keys}]
    }.deep_stringify_keys

    post :find_toxicity, params: {retrievalContexts: retrieval_contexts, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end

  test 'find_toxicity returns toxicity if detected in both system prompt and retrieval contexts' do
    sign_in(@authorized_student1)
    system_prompt = 'hello system prompt'
    retrieval_contexts = ['retrieval1', 'retrieval2']
    locale = 'en'
    toxicity_response_system_prompt = {text: system_prompt, blocked_by: 'comprehend', details: {}}
    toxicity_response_retrieval_contexts = {text: retrieval_contexts.join(' '), blocked_by: 'comprehend', details: {}}
    AichatSafetyHelper.expects(:find_toxicity).with('user', system_prompt, locale).returns(toxicity_response_system_prompt)
    AichatSafetyHelper.expects(:find_toxicity).with('user', retrieval_contexts.join(' '), locale).returns(toxicity_response_retrieval_contexts)

    expected_response = {
      flaggedFields: [
        {field: 'systemPrompt', toxicity: toxicity_response_system_prompt.camelize_keys},
        {field: 'retrievalContexts', toxicity: toxicity_response_retrieval_contexts.camelize_keys}
      ]
    }.deep_stringify_keys

    post :find_toxicity, params: {systemPrompt: system_prompt, retrievalContexts: retrieval_contexts, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end

  test 'find_toxicity returns empty flagged fields if no toxicity detected' do
    sign_in(@authorized_student1)
    system_prompt = 'hello system prompt'
    retrieval_contexts = ['retrieval1', 'retrieval2']
    locale = 'en'
    AichatSafetyHelper.expects(:find_toxicity).twice.returns(nil)

    expected_response = {
      flaggedFields: []
    }.deep_stringify_keys

    post :find_toxicity, params: {systemPrompt: system_prompt, retrievalContexts: retrieval_contexts, locale: locale}, as: :json
    assert_response :success
    assert_equal expected_response, json_response
  end

  # Submit teacher feedback tests
  test 'submit_teacher_feedback returns bad request if eventId is missing' do
    sign_in(@authorized_teacher1)
    post :submit_teacher_feedback, params: {feedback: SharedConstants::AI_CHAT_TEACHER_FEEDBACK[:CLEAN_DISAGREE]}, as: :json
    assert_response :bad_request
  end

  test 'submit_teacher_feedback returns bad request if feedback is invalid' do
    sign_in(@authorized_teacher1)
    post :submit_teacher_feedback, params: {eventId: @student1_aichat_event1.id, feedback: 'invalid'}, as: :json
    assert_response :bad_request
  end

  test 'submit_teacher_feedback returns forbidden if user is not an authorized teacher' do
    sign_in(@authorized_student1)
    post :submit_teacher_feedback, params: {eventId: @student1_aichat_event1.id, feedback: SharedConstants::AI_CHAT_TEACHER_FEEDBACK[:CLEAN_DISAGREE]}, as: :json
    assert_response :forbidden
  end

  test 'submit_teacher_feedback returns forbidden if the user is not the teacher of the requested student' do
    sign_in(@authorized_teacher2)
    post :submit_teacher_feedback, params: {eventId: @student1_aichat_event1.id, feedback: SharedConstants::AI_CHAT_TEACHER_FEEDBACK[:CLEAN_DISAGREE]}, as: :json
    assert_response :forbidden
  end

  test 'submit_teacher_feedback updates teacher feedback in AichatEvent' do
    feedback = SharedConstants::AI_CHAT_TEACHER_FEEDBACK[:CLEAN_DISAGREE]
    sign_in(@authorized_teacher1)
    post :submit_teacher_feedback, params: {eventId: @student1_aichat_event1.id, feedback: feedback}, as: :json
    assert_response :success
    @student1_aichat_event1.reload
    assert_equal @student1_aichat_event1.aichat_event['teacherFeedback'], feedback
  end

  test 'submit_teacher_feedback clears feedback if no feedback is provided' do
    @student1_aichat_event1.aichat_event['teacherFeedback'] = SharedConstants::AI_CHAT_TEACHER_FEEDBACK[:CLEAN_DISAGREE]
    @student1_aichat_event1.save!

    sign_in(@authorized_teacher1)
    post :submit_teacher_feedback, params: {eventId: @student1_aichat_event1.id}, as: :json
    assert_response :success
    @student1_aichat_event1.reload
    assert_nil @student1_aichat_event1.aichat_event['teacherFeedback']
  end
end
