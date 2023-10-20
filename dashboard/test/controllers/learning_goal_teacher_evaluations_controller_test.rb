require 'test_helper'

class LearningGoalTeacherEvaluationsControllerTest < ActionController::TestCase
  setup do
    @teacher = create :teacher
    sign_in @teacher

    @student = create :student

    @script_level = create :script_level
    assert_equal @script_level.script, @script_level.lesson.script

    @fake_ip = '127.0.0.1'
    @storage_id = create_storage_id_for_user(@student.id)

    @rubric = create :rubric, level: @script_level.level, lesson: @script_level.lesson
    @learning_goal_1 = create :learning_goal, rubric: @rubric, learning_goal: 'learning-goal-1'
    @learning_goal_2 = create :learning_goal, rubric: @rubric, learning_goal: 'learning-goal-2'
    assert_equal 2, @rubric.learning_goals.count

    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    @channel_id = channel_token.channel

    # Don't actually talk to S3 when running SourceBucket.new
    AWS::S3.stubs :create_client
    stub_project_source_data(@channel_id)
    _, @project_id = storage_decrypt_channel_id(@channel_id)
    @version_id = "fake-version-id"

    @learning_goal_teacher_evaluation = create :learning_goal_teacher_evaluation, teacher_id: @teacher.id, user_id: @student.id, learning_goal_id: @learning_goal_1.id, project_id: @project_id, project_version: @version_id
  end

  test 'create learning goal teacher evaluation' do
    user_id = @student.id
    teacher_id = @teacher.id
    learning_goal_id = @learning_goal_2.id
    understanding = 1
    feedback = 'feedback'

    post :create, params: {
      userId: user_id,
      learningGoalId: learning_goal_id,
      understanding: understanding,
      feedback: feedback,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    assert_equal user_id, response_json['user_id']
    assert_equal learning_goal_id, response_json['learning_goal_id']
    assert_equal teacher_id, response_json['teacher_id']
    assert_equal understanding, response_json['understanding']
    assert_equal feedback, response_json['feedback']
    refute_nil response_json['created_at']
  end

  test 'update learning goal evaluation' do
    id = @learning_goal_teacher_evaluation.id
    user_id = @student.id
    teacher_id = @teacher.id
    learning_goal_id = @learning_goal_1.id
    understanding = 2
    feedback = 'kcabdeef'

    post :update, params: {
      id: id,
      understanding: understanding,
      feedback: feedback
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal id, response_json['id']
    assert_equal user_id, response_json['user_id']
    assert_equal learning_goal_id, response_json['learning_goal_id']
    assert_equal teacher_id, response_json['teacher_id']
    assert_equal understanding, response_json['understanding']
    assert_equal feedback, response_json['feedback']
    refute_nil response_json['created_at']
  end

  test 'get_evaluation method' do
    get :get_evaluation, params: {
      userId: @learning_goal_teacher_evaluation.user_id,
      learningGoalId: @learning_goal_teacher_evaluation.learning_goal_id
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal response_json['id'], @learning_goal_teacher_evaluation.id
  end

  test 'get_or_create_evaluation method gets existing evaluation' do
    post :get_or_create_evaluation, params: {
      userId: @learning_goal_teacher_evaluation.user_id,
      learningGoalId: @learning_goal_teacher_evaluation.learning_goal_id
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    assert_equal response_json['id'], @learning_goal_teacher_evaluation.id
  end

  test 'get_or_create_evaluation method creates evaluation if one does not exist' do
    new_student = create :student
    new_storage_id = create_storage_id_for_user(new_student.id)

    new_channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, new_storage_id, @script_level.script_id)
    new_channel_id = new_channel_token.channel

    user_id = new_student.id
    learning_goal_id = @learning_goal_1.id

    stub_project_source_data(new_channel_id)

    post :get_or_create_evaluation, params: {
      userId: user_id,
      learningGoalId: learning_goal_id,
    }
    assert_response :success

    response_json = JSON.parse(response.body)
    refute_nil response_json['id']
    refute_equal response_json['id'], @learning_goal_teacher_evaluation.id
    assert_equal response_json['user_id'], user_id
  end

  # Test create responses
  test_user_gets_response_for :create, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :create, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :create, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: :teacher, response: :success

  # Test update responses
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_teacher_evaluation.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_teacher_evaluation.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_teacher_evaluation.id}}, user: -> {@teacher}, response: :success
  # Test returns forbidden for a different teacher
  test_user_gets_response_for :update, params: -> {{id: @learning_goal_teacher_evaluation.id}}, user: :teacher, response: :forbidden

  # Test get_evaluation responses
  test_user_gets_response_for :get_evaluation, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :get_evaluation, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :get_evaluation, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: -> {@teacher}, response: :success
  # Test returns not found for a different teacher
  test_user_gets_response_for :get_evaluation, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: :teacher, response: :not_found

  # Test get_or_create responses
  test_user_gets_response_for :get_or_create_evaluation, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: nil, response: :redirect, redirected_to: '/users/sign_in'
  test_user_gets_response_for :get_or_create_evaluation, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: :student, response: :forbidden
  test_user_gets_response_for :get_or_create_evaluation, params: -> {{learningGoalId: @learning_goal_1.id, userId: @student.id}}, user: :teacher, response: :success

  private def stub_project_source_data(channel_id, code: 'fake-code', version_id: 'fake-version-id')
    fake_main_json = {source: code}.to_json
    fake_source_data = {
      status: 'FOUND',
      body: StringIO.new(fake_main_json),
      version_id: version_id
    }
    SourceBucket.any_instance.stubs(:get).with(channel_id, "main.json").returns(fake_source_data)
  end
end
