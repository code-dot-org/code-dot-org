require 'test_helper'

class AiRubricConfigTest < ActiveSupport::TestCase
  setup do
    @script_level = create(:script_level)
    @unit = @script_level.script
    @level = @script_level.level
    @lesson = @script_level.lesson
  end

  test 'get_lesson_s3_name returns S3 name from rubric s3_config_dir' do
    Rubric.any_instance.stubs(:validate_ai_config)
    create(:rubric, lesson: @lesson, level: @level, s3_config_dir: 'test-lesson-L1')

    result = AiRubricConfig.get_lesson_s3_name(@script_level)
    assert_equal 'test-lesson-L1', result
  end

  test 'get_lesson_s3_name returns nil when no rubric exists' do
    result = AiRubricConfig.get_lesson_s3_name(@script_level)
    assert_nil result
  end

  test 'get_lesson_s3_name returns nil when rubric has no s3_config_dir' do
    create(:rubric, lesson: @lesson, level: @level, s3_config_dir: nil)

    result = AiRubricConfig.get_lesson_s3_name(@script_level)
    assert_nil result
  end

  test 'get_lesson_s3_name returns nil for nil script_level' do
    result = AiRubricConfig.get_lesson_s3_name(nil)
    assert_nil result
  end

  test 'ai_enabled? returns true when rubric has s3_config_dir' do
    Rubric.any_instance.stubs(:validate_ai_config)
    create(:rubric, lesson: @lesson, level: @level, s3_config_dir: 'test-lesson-L1')

    assert AiRubricConfig.ai_enabled?(@script_level)
  end

  test 'ai_enabled? returns false when no rubric exists' do
    refute AiRubricConfig.ai_enabled?(@script_level)
  end

  test 'validate passes when s3_config_dir is nil and no ai-enabled learning goals' do
    CDO.stubs(:aws_s3_emulated).returns(false)
    rubric = create(:rubric, lesson: @lesson, level: @level, s3_config_dir: nil)
    create(:learning_goal, rubric: rubric, learning_goal: 'goal-1', ai_enabled: false)

    # should not raise
    AiRubricConfig.validate_ai_config_for_rubric(rubric)
  end

  test 'validate passes when s3_config_dir is valid and no ai-enabled learning goals' do
    CDO.stubs(:aws_s3_emulated).returns(false)
    Rubric.any_instance.stubs(:validate_ai_config)
    rubric = create(:rubric, lesson: @lesson, level: @level, s3_config_dir: 'test-lesson')
    create(:learning_goal, rubric: rubric, learning_goal: 'goal-1', ai_enabled: false)

    stub_valid_s3_config('test-lesson')

    # should not raise
    AiRubricConfig.validate_ai_config_for_rubric(rubric)
  end

  test 'validate fails when s3_config_dir is present but invalid' do
    CDO.stubs(:aws_s3_emulated).returns(false)
    Rubric.any_instance.stubs(:validate_ai_config)
    rubric = create(:rubric, lesson: @lesson, level: @level, s3_config_dir: 'missing-lesson')

    stub_valid_s3_config('other-lesson')

    # In production, Aws::S3::Errors::NoSuchKey is caught by
    # validate_s3_config_dir and re-raised as a RuntimeError. In tests,
    # StubNoSuchKey doesn't inherit from that class, so it isn't caught
    # by the rescue and bubbles up directly.
    exception = assert_raises AiRubricConfig::StubNoSuchKey do
      AiRubricConfig.validate_ai_config_for_rubric(rubric)
    end
    assert_includes exception.message, 'missing-lesson'
  end

  test 'validate passes when ai-enabled learning goal matches S3 config' do
    CDO.stubs(:aws_s3_emulated).returns(false)
    Rubric.any_instance.stubs(:validate_ai_config)
    rubric = create(:rubric, lesson: @lesson, level: @level, s3_config_dir: 'test-lesson')
    create(:learning_goal, rubric: rubric, learning_goal: 'goal-1', ai_enabled: true)

    stub_valid_s3_config('test-lesson', learning_goal_names: ['goal-1'])

    # should not raise
    AiRubricConfig.validate_ai_config_for_rubric(rubric)
  end

  test 'validate fails when ai-enabled learning goal does not match S3 config' do
    CDO.stubs(:aws_s3_emulated).returns(false)
    Rubric.any_instance.stubs(:validate_ai_config)
    rubric = create(:rubric, lesson: @lesson, level: @level, s3_config_dir: 'test-lesson')
    create(:learning_goal, rubric: rubric, learning_goal: 'missing-goal', ai_enabled: true)

    stub_valid_s3_config('test-lesson', learning_goal_names: ['other-goal'])

    exception = assert_raises RuntimeError do
      AiRubricConfig.validate_ai_config_for_rubric(rubric)
    end
    assert_includes exception.message, 'Missing AI config in S3 for lesson test-lesson learning goals: ["missing-goal"]'
  end

  private def stub_valid_s3_config(lesson_s3_name, learning_goal_names: [])
    s3_client = Aws::S3::Client.new(stub_responses: true)
    AiRubricConfig.stubs(:s3_client).returns(s3_client)

    csv_rows = learning_goal_names.map {|name| "#{name},a,b,c,d"}.join("\n")
    fake_rubric_csv = "Key Concept,Extensive Evidence,Convincing Evidence,Limited Evidence,No Evidence\n#{csv_rows}"

    path_prefix = AiRubricConfig::S3_AI_RELEASE_PATH
    bucket = {
      "#{path_prefix}#{lesson_s3_name}/params.json" => '{"response-type": "tsv"}',
      "#{path_prefix}#{lesson_s3_name}/system_prompt.txt" => 'fake system prompt',
      "#{path_prefix}#{lesson_s3_name}/standard_rubric.csv" => fake_rubric_csv,
    }

    s3_client.stub_responses(
      :get_object,
      lambda do |context|
        key = context.params[:key]
        obj = bucket[key]
        raise AiRubricConfig::StubNoSuchKey.new(key) unless obj
        {body: StringIO.new(obj)}
      end
    )

    s3_client.stub_responses(:list_objects_v2, {contents: []})
  end
end
