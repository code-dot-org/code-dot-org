require "test_helper"

class EvaluateRubricJobTest < ActiveJob::TestCase
  setup do
    @student = create :student
    @script_level = create :script_level
    assert_equal @script_level.script, @script_level.lesson.script

    @fake_ip = '127.0.0.1'
    @storage_id = create_storage_id_for_user(@student.id)

    @rubric = create :rubric, level: @script_level.level, lesson: @script_level.lesson
    create :learning_goal, rubric: @rubric, learning_goal: 'learning-goal-1'
    create :learning_goal, rubric: @rubric, learning_goal: 'learning-goal-2'
    assert_equal 2, @rubric.learning_goals.count

    # Don't actually talk to S3
    AWS::S3.stubs :create_client
  end

  test "job succeeds on ai-enabled level" do
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    stub_project_source_data(channel_id)

    # stub lesson S3 lookups
    EvaluateRubricJob.any_instance.stubs(:read_file_from_s3).with('fake-lesson-s3-name', 'system_prompt.txt').returns('fake-system-prompt')
    EvaluateRubricJob.any_instance.stubs(:read_file_from_s3).with('fake-lesson-s3-name', 'standard_rubric.csv').returns('fake-standard-rubric')
    EvaluateRubricJob.any_instance.stubs(:read_examples).with('fake-lesson-s3-name').returns([['fake-code-1', 'fake-response-1'], ['fake-code-2', 'fake-response-2']])

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, script_level_id: @script_level.id)
    end

    verify_stored_ai_evaluations(channel_id: channel_id, rubric: @rubric, user: @student)
  end

  test "job fails on non-ai level" do
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(@script_level).returns(nil)

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.new.perform(user_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, 'lesson_s3_name not found'
    assert_equal 0, LearningGoalAiEvaluation.where(user_id: @student.id).count
  end

  test "job fails if channel token does not exist" do
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.new.perform(user_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, 'channel token not found'
    assert_equal 0, LearningGoalAiEvaluation.where(user_id: @student.id).count
  end

  test "job fails if project source code not found" do
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)
    channel_id = channel_token.channel

    SourceBucket.any_instance.stubs(:get).with(channel_id, "main.json").returns({status: 'NOT_FOUND'})

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.new.perform(user_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, 'main.json not found'
    assert_equal 0, LearningGoalAiEvaluation.where(user_id: @student.id).count
  end

  test "job fails if rubric not found" do
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')
    @rubric.destroy

    exception = assert_raises ActiveRecord::RecordNotFound do
      EvaluateRubricJob.new.perform(user_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, "Couldn't find Rubric"
    assert_equal 0, LearningGoalAiEvaluation.where(user_id: @student.id).count
  end

  # stub out the calls to fetch project data from S3
  private def stub_project_source_data(channel_id, code: 'fake-code', version_id: 'fake-version-id')
    fake_main_json = {source: code}.to_json
    fake_source_data = {
      status: 'FOUND',
      body: StringIO.new(fake_main_json),
      version_id: version_id
    }
    SourceBucket.any_instance.stubs(:get).with(channel_id, "main.json").returns(fake_source_data)
  end

  # verify the job wrote the expected LearningGoalAiEvaluations to the database
  private def verify_stored_ai_evaluations(
    channel_id:,
    rubric:,
    user:,
    expected_understanding: SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.EXTENSIVE,
    version_id: 'fake-version-id'
  )
    _owner_id, project_id = storage_decrypt_channel_id(channel_id)
    rubric.learning_goals.each do |learning_goal|
      ai_eval = LearningGoalAiEvaluation.find_by(user_id: user.id, learning_goal_id: learning_goal.id)
      assert_equal expected_understanding, ai_eval.understanding
      assert_equal project_id, ai_eval.project_id
      assert_equal version_id, ai_eval.project_version
    end
  end
end
