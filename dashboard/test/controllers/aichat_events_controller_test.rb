require 'test_helper'

class AichatEventsControllerTest < ActionController::TestCase
  self.use_transactional_test_case = true

  setup_all do
    @authorized_teacher1 = create(:authorized_teacher)
    @authorized_teacher2 = create(:authorized_teacher)
    @unauthorized_student = create(:student)
    @unauthorized_teacher = create(:teacher)
    unit_group = create(:unit_group, name: 'exploring-gen-ai-2024')
    @section = create(:section, user: @authorized_teacher1, unit_group: unit_group)
    @authorized_student1 = create(:follower, section: @section).student_user

    @level = create(:level)
    @script = create(:script, :in_single_unit_course)

    @valid_student1_chat_message1 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 1', status: 'ok', timestamp: Time.now.to_i}
    valid_student1_chat_message2 = {role: 'user', chatMessageText: 'hello from authorized student 1 - message 2', status: 'ok', timestamp: Time.now.to_i}

    @student1_aichat_event1 = create(:aichat_event, user_id: @authorized_student1.id, level_id: @level.id, script_id: @script.id, aichat_event: @valid_student1_chat_message1)
    @student1_aichat_event2 = create(:aichat_event, user_id: @authorized_student1.id, level_id: @level.id, script_id: @script.id, aichat_event: valid_student1_chat_message2)

    @valid_params_log_chat_event = {
      newChatEvent: @valid_student1_chat_message1,
      aichatContext: {
        currentLevelId: @level.id,
        scriptId: @script.id,
        channelId: "test"
      }
    }

    @valid_params_student1_chat_history = {
      userId: @authorized_student1.id,
      levelId: @level.id,
      scriptId: @script.id,
    }
  end

  setup do
    @controller.stubs(:storage_decrypt_channel_id).returns([123, 456])
  end

  # *****
  # log_chat_event tests
  # *****

  test 'log_chat_event returns forbidden if user is not signed in' do
    post :log_chat_event, params: {}, as: :json
    assert_response :forbidden
  end

  test 'teachers without access to log_chat_event get forbidden response' do
    sign_in(@unauthorized_teacher)
    post :log_chat_event, params: @valid_params_log_chat_event, as: :json
    assert_response :forbidden
  end

  test 'students without access to log_chat_event get forbidden response' do
    sign_in(@unauthorized_student)
    post :log_chat_event, params: @valid_params_log_chat_event, as: :json
    assert_response :forbidden
  end

  test 'unauthorized users can access log_chat_event from python lab levels' do
    sign_in(@unauthorized_student)
    python_lab_level = create(:pythonlab)
    params_with_python_level = @valid_params_log_chat_event.merge(aichatContext: @valid_params_log_chat_event[:aichatContext].merge(currentLevelId: python_lab_level.id))
    post :log_chat_event, params: params_with_python_level, as: :json
    assert_response :success
  end

  test 'authorized teacher has access to log_chat_event' do
    sign_in(@authorized_teacher1)
    post :log_chat_event, params: @valid_params_log_chat_event, as: :json
    assert_response :success
  end

  test 'student of authorized teacher has access to log_chat_event' do
    sign_in(@authorized_student1)
    post :log_chat_event, params: @valid_params_log_chat_event, as: :json
    assert_response :success
  end

  test 'Bad request if missing param for log_chat_event' do
    sign_in(@authorized_teacher1)
    post :log_chat_event, params: @valid_params_log_chat_event.except(:aichatContext), as: :json
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
    model_customizations = {temperature: 0.5, retrievalContexts: ["test"], systemPrompt: "test"}.stringify_keys
    request = create(
      :aichat_request,
      user_id: @authorized_student1.id,
      model_customizations: model_customizations.to_json,
      stored_messages: [].to_json,
      new_message: @valid_student1_chat_message1.to_json,
      execution_status: SharedConstants::AI_REQUEST_EXECUTION_STATUS[:SUCCESS]
    )
    params = @valid_params_log_chat_event.merge(newChatEvent: @valid_params_log_chat_event[:newChatEvent].merge(requestId: request.id))

    post :log_chat_event, params: params, as: :json

    assert_response :success
    event_id = json_response['id']
    assert_equal json_response, params[:newChatEvent].merge(id: event_id).stringify_keys
    aichat_event_row = AichatEvent.find(event_id)
    stored_aichat_event = aichat_event_row.aichat_event
    assert_equal request.id, stored_aichat_event['requestId']
  end

  # *****
  # chat_history tests
  # *****

  test 'chat_history returns forbidden if user is not signed in' do
    get :chat_history, params: {}, as: :json
    assert_response :forbidden
  end

  test 'Bad request if required params are not included for chat_history' do
    sign_in(@authorized_teacher1)
    get :chat_history, params: {studentId: @authorized_student1.id}, as: :json
    assert_response :bad_request
  end

  test 'student of authorized teacher has access to their own chat_history' do
    sign_in(@authorized_student1)
    get :chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :success
  end

  test 'student of authorized teacher does not have access to chat_history of another student' do
    another_student = create(:follower, section: @section).student_user
    sign_in(another_student)
    get :chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :forbidden
  end

  test 'authorized teacher has access to chat_history if teacher of student' do
    sign_in(@authorized_teacher1)
    get :chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :success
  end

  test 'authorized teacher does not have access to chat_history if not teacher of student' do
    sign_in(@authorized_teacher2)
    get :chat_history, params: @valid_params_student1_chat_history, as: :json
    assert_response :forbidden
  end

  test 'chat_history successfully returns list of student aichat_events' do
    sign_in(@authorized_teacher1)
    post :chat_history, params: @valid_params_student1_chat_history, as: :json
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

  # *****
  # submit_teacher_feedback tests
  # *****

  test 'submit_teacher_feedback returns forbidden if user is not signed in' do
    post :submit_teacher_feedback, params: {}, as: :json
    assert_response :forbidden
  end

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
