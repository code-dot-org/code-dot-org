require 'test_helper'

class AiTutorInteractionsControllerTest < ActionController::TestCase
  setup do
    @student_with_ai_tutor_access = create :student_with_ai_tutor_access
    @student = create :student
  end

  test "create AI Tutor Interaction with valid params" do
    sign_in @student_with_ai_tutor_access
    assert_creates(AiTutorInteraction) do
      post :create, params: {
        level_id: 1234,
          script_id: 987,
          type: SharedConstants::AI_TUTOR_TYPES[:GENERAL_CHAT],
          prompt: "Can you help me?",
          status: SharedConstants::AI_TUTOR_INTERACTION_STATUS[:OK],
          ai_response: "Yes, I can help."
      }
    end
  end

  test "student without access can not create AI Tutor Interaction" do
    sign_in @student
    assert_does_not_create(AiTutorInteraction) do
      post :create, params: {
        level_id: 5678,
          script_id: 246,
          type: SharedConstants::AI_TUTOR_TYPES[:GENERAL_CHAT],
          prompt: "Can you help me?",
          status: SharedConstants::AI_TUTOR_INTERACTION_STATUS[:OK],
          ai_response: "Yes, I can help."
      }
    end
    assert_response :forbidden
  end

  test "does not create AI Tutor Interaction with invalid type param" do
    sign_in @student_with_ai_tutor_access
    assert_does_not_create(AiTutorInteraction) do
      post :create, params: {
        level_id: 1234,
          script_id: 987,
          type: "trash can",
          prompt: "Can you help me?",
          status: SharedConstants::AI_TUTOR_INTERACTION_STATUS[:OK],
          ai_response: "Yes, I can help."
      }
    end
    assert_response :not_acceptable
    assert_includes(@response.body, "There was an error creating a new AiTutorInteraction.")
  end

  test "does not create AI Tutor Interaction with invalid status param" do
    sign_in @student_with_ai_tutor_access
    assert_does_not_create(AiTutorInteraction) do
      post :create, params: {
        level_id: 1234,
          script_id: 987,
          type: SharedConstants::AI_TUTOR_TYPES[:GENERAL_CHAT],
          prompt: "Can you help me?",
          status: "broken",
          ai_response: "Yes, I can help."
      }
    end
    assert_response :not_acceptable
    assert_includes(@response.body, "Staus is unacceptable")
  end

  test "create AI Tutor Interaction for project backed level with valid params" do
    sign_in @student_with_ai_tutor_access
    @level = create(:level, :with_script)
    assert_creates(AiTutorInteraction) do
      post :create, params: {
        level_id: @level.id,
          script_id: @level.script_levels.first.script.id,
          type: SharedConstants::AI_TUTOR_TYPES[:COMPILATION],
          prompt: "Can you help me?",
          status: SharedConstants::AI_TUTOR_INTERACTION_STATUS[:PROFANITY_VIOLATION],
          ai_response: "Yes, I can help.",
          isProjectBacked: true
      }
    end
  end

  test "create AI Tutor Interaction for project backed level in lesson with lesson group with valid params" do
    sign_in @student_with_ai_tutor_access
    @lesson = create(:lesson, :with_lesson_group)
    @level = create(:level)
    @script_level = create :script_level, script: @lesson.script, lesson: @lesson, levels: [@level]
    @fake_ip = '127.0.0.1'
    fake_version_id = "fake-version-id"
    @storage_id = create_storage_id_for_user(@student_with_ai_tutor_access.id)
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    @channel_id = channel_token.channel

    # Don't actually talk to S3 when running SourceBucket.new
    AWS::S3.stubs :create_client
    stub_project_source_data(@channel_id)
    _, @project_id = storage_decrypt_channel_id(@channel_id)
    @version_id = "fake-version-id"

    assert_creates(AiTutorInteraction) do
      post :create, params: {
        level_id: @script_level.levels.first.id,
          script_id: @script_level.script.id,
          type: SharedConstants::AI_TUTOR_TYPES[:VALIDATION],
          prompt: "Why is my test failing?",
          status: SharedConstants::AI_TUTOR_INTERACTION_STATUS[:OK],
          ai_response: "Because your code is wrong.",
          isProjectBacked: true
      }
      created_ai_tutor_interaction = AiTutorInteraction.last
      assert created_ai_tutor_interaction.project_id == @project_id.to_s
      assert created_ai_tutor_interaction.project_version_id == fake_version_id
    end
  end

  test 'index returns AI Tutor Interactions for section owned by teacher who can view chats' do
    teacher = @student_with_ai_tutor_access.teachers.first
    sign_in teacher
    User.any_instance.stubs(:can_view_student_ai_chat_messages?).returns(true)
    section = @student_with_ai_tutor_access.sections_as_student.first
    num_ai_tutor_interactions = 3
    num_ai_tutor_interactions.times do
      create :ai_tutor_interaction, user: @student_with_ai_tutor_access
    end
    get :index, params: {
      sectionId: section.id,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert response_json.length, num_ai_tutor_interactions
    assert response_json.first["userId"], @student_with_ai_tutor_access.id
  end

  test 'index returns forbidden for section not owned by teacher' do
    teacher = @student_with_ai_tutor_access.teachers.first
    sign_in teacher
    User.any_instance.stubs(:can_view_student_ai_chat_messages?).returns(true)
    random_section = create :section
    refute teacher.sections.include?(random_section)

    get :index, params: {sectionId: random_section.id}
    assert_response :forbidden
  end

  test 'index returns forbidden for teacher who can not view chats' do
    teacher = @student_with_ai_tutor_access.teachers.first
    sign_in teacher
    User.any_instance.stubs(:can_view_student_ai_chat_messages?).returns(false)
    section = @student_with_ai_tutor_access.sections_as_student.first

    get :index, params: {
      sectionId: section.id,
    }
    assert_response :forbidden
  end

  test 'index returns forbidden when students provide parameters' do
    sign_in @student_with_ai_tutor_access

    get :index, params: {userId: '123'}
    assert_response :forbidden
    response_body = JSON.parse(response.body)
    assert_equal 'Students cannot provide filters.', response_body['error']
  end

  test 'index returns AI Tutor Interactions when student owns chats' do
    sign_in @student_with_ai_tutor_access
    num_ai_tutor_interactions = 2
    num_ai_tutor_interactions.times do
      create :ai_tutor_interaction, user: @student_with_ai_tutor_access
    end
    get :index
    assert_response :success

    response_json = JSON.parse(response.body)
    assert response_json.length, num_ai_tutor_interactions
    assert response_json.first["userId"], @student_with_ai_tutor_access.id
  end

  test 'index returns forbidden when student is not in teacher section' do
    random_teacher = create :teacher
    sign_in random_teacher
    User.any_instance.stubs(:can_view_student_ai_chat_messages?).returns(true)
    create :ai_tutor_interaction, user: @student_with_ai_tutor_access

    get :index, params: {userId: @student_with_ai_tutor_access.id}
    assert_response :forbidden
  end

  test 'index returns forbidden when teacher does not have access to view chats' do
    teacher = @student_with_ai_tutor_access.teachers.first
    sign_in teacher
    User.any_instance.stubs(:can_view_student_ai_chat_messages?).returns(false)
    create :ai_tutor_interaction, user: @student_with_ai_tutor_access
    get :index, params: {
      userId: @student_with_ai_tutor_access.id,
    }
    assert_response :forbidden
  end

  test 'index returns AI Tutor Interactions for student in teacher section' do
    teacher = @student_with_ai_tutor_access.teachers.first
    sign_in teacher
    User.any_instance.stubs(:can_view_student_ai_chat_messages?).returns(true)
    num_ai_tutor_interactions = 3
    num_ai_tutor_interactions.times do
      create :ai_tutor_interaction, user: @student_with_ai_tutor_access
    end
    get :index, params: {
      userId: @student_with_ai_tutor_access.id,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert response_json.length, num_ai_tutor_interactions
    assert response_json.first["userId"], @student_with_ai_tutor_access.id
  end

  private def stub_project_source_data(channel_id, code: 'fake-code', version_id: 'fake-version-id')
    fake_main_json = {source: code}.to_json
    fake_source_data = {
      status: 'FOUND',
      body: StringIO.new(fake_main_json),
      version_id: version_id,
      last_modified: DateTime.now
    }
    SourceBucket.any_instance.stubs(:get).with(channel_id, "main.json").returns(fake_source_data)
  end
end
