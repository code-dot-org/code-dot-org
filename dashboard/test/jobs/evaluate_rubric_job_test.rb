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
  end

  test "job succeeds on ai-enabled level" do
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(@script_level).returns('fake-lesson-s3-name')

    # create a project
    channel_token = ChannelToken.find_or_create_channel_token(@script_level.level, @fake_ip, @storage_id, @script_level.script_id)

    stub_project_source_data(channel_token.channel)

    # run the job
    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: @student.id, script_level_id: @script_level.id)
    end

    # verify the job wrote the expected data to the database
    _owner_id, project_id = storage_decrypt_channel_id(channel_token.channel)
    @rubric.learning_goals.each do |learning_goal|
      ai_eval = LearningGoalAiEvaluation.find_by(user_id: @student.id, learning_goal_id: learning_goal.id)
      assert_equal SharedConstants::RUBRIC_UNDERSTANDING_LEVELS.EXTENSIVE, ai_eval.understanding
      assert_equal project_id, ai_eval.project_id
      assert_equal 'fake-version-id', ai_eval.project_version
    end
  end

  test "job fails on non-ai level" do
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(@script_level).returns(nil)

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.new.perform(user_id: @student.id, script_level_id: @script_level.id)
    end
    assert_includes exception.message, 'lesson_s3_name not found'
  end

  # stub out the calls to fetch project data from S3
  private def stub_project_source_data(channel_id, code: 'fake-code', version_id: 'fake-version-id')
    fake_main_json = {source: code}.to_json
    fake_source_data = {body: StringIO.new(fake_main_json), version_id: version_id}
    SourceBucket.any_instance.stubs(:get).with(channel_id, "main.json").returns(fake_source_data)
  end
end
