require 'test_helper'

class AiRubricConfigTest < ActiveSupport::TestCase
  setup do
    @script_level = create(:script_level)
    @unit = @script_level.script
    @level = @script_level.level
  end

  test 'get_lesson_s3_name returns S3 name from unit ai_rubric_s3_config property' do
    @unit.update!(properties: @unit.properties.merge('ai_rubric_s3_config' => {@level.name => 'test-lesson-L1'}))

    result = AiRubricConfig.get_lesson_s3_name(@script_level)
    assert_equal 'test-lesson-L1', result
  end

  test 'get_lesson_s3_name returns nil when unit has no ai_rubric_s3_config' do
    result = AiRubricConfig.get_lesson_s3_name(@script_level)
    assert_nil result
  end

  test 'get_lesson_s3_name returns nil when level name not in ai_rubric_s3_config' do
    @unit.update!(properties: @unit.properties.merge('ai_rubric_s3_config' => {'other_level' => 'test-lesson-L1'}))

    result = AiRubricConfig.get_lesson_s3_name(@script_level)
    assert_nil result
  end

  test 'get_lesson_s3_name returns nil for nil script_level' do
    result = AiRubricConfig.get_lesson_s3_name(nil)
    assert_nil result
  end

  test 'ai_enabled? returns true when unit has matching ai_rubric_s3_config' do
    @unit.update!(properties: @unit.properties.merge('ai_rubric_s3_config' => {@level.name => 'test-lesson-L1'}))

    assert AiRubricConfig.ai_enabled?(@script_level)
  end

  test 'ai_enabled? returns false when unit has no ai_rubric_s3_config' do
    refute AiRubricConfig.ai_enabled?(@script_level)
  end

  test 'validate_learning_goals_for_unit! skips when aws_s3_emulated' do
    CDO.stubs(:aws_s3_emulated).returns(true)
    @unit.update!(properties: @unit.properties.merge('ai_rubric_s3_config' => {@level.name => 'test-lesson-L1'}))

    # Should not raise even without S3 stubs
    assert_nothing_raised do
      AiRubricConfig.validate_learning_goals_for_unit!(@unit)
    end
  end

  test 'validate_learning_goals_for_unit! skips when unit has no ai_rubric_s3_config' do
    CDO.stubs(:aws_s3_emulated).returns(false)

    assert_nothing_raised do
      AiRubricConfig.validate_learning_goals_for_unit!(@unit)
    end
  end

  test 'validate_learning_goals_for_unit! raises for invalid ai-enabled learning goal' do
    CDO.stubs(:aws_s3_emulated).returns(false)

    lesson = @script_level.lesson
    @unit.update!(properties: @unit.properties.merge('ai_rubric_s3_config' => {@level.name => 'test-lesson-L1'}))
    rubric = create(:rubric, lesson: lesson, level: @level)
    learning_goal = create(:learning_goal, rubric: rubric, key: 'lg-1')
    # Bypass model validation to set up invalid state
    learning_goal.update_columns(ai_enabled: true, learning_goal: 'non-configured goal')

    stub_s3_rubric_csv('test-lesson-L1')

    error = assert_raises(RuntimeError) do
      AiRubricConfig.validate_learning_goals_for_unit!(@unit)
    end
    assert_includes error.message, 'Missing AI config in S3'
    assert_includes error.message, 'non-configured goal'
  end

  test 'validate_learning_goals_for_unit! passes for valid ai-enabled learning goal' do
    CDO.stubs(:aws_s3_emulated).returns(false)

    lesson = @script_level.lesson
    @unit.update!(properties: @unit.properties.merge('ai_rubric_s3_config' => {@level.name => 'test-lesson-L1'}))
    rubric = create(:rubric, lesson: lesson, level: @level)
    learning_goal = create(:learning_goal, rubric: rubric, key: 'lg-1')
    # Bypass model validation to set up ai-enabled state
    learning_goal.update_columns(ai_enabled: true, learning_goal: 'ai-configured learning goal 1')

    stub_s3_rubric_csv('test-lesson-L1')

    assert_nothing_raised do
      AiRubricConfig.validate_learning_goals_for_unit!(@unit)
    end
  end

  private def stub_s3_rubric_csv(lesson_s3_name)
    s3_client = Aws::S3::Client.new(stub_responses: true)
    AiRubricConfig.stubs(:s3_client).returns(s3_client)

    fake_rubric_csv = <<~CSV
      Key Concept,Extensive Evidence,Convincing Evidence,Limited Evidence,No Evidence
      ai-configured learning goal 1,abc,def,ghi,jkl
      ai-configured learning goal 2,abc,def,ghi,jkl
    CSV

    path_prefix = AiRubricConfig::S3_AI_RELEASE_PATH
    bucket = {
      "#{path_prefix}#{lesson_s3_name}/standard_rubric.csv" => fake_rubric_csv,
    }

    s3_client.stub_responses(
      :get_object,
      lambda do |context|
        key = context.params[:key]
        obj = bucket[key]
        if obj
          {body: obj}
        else
          'NoSuchKey'
        end
      end
    )
  end
end
