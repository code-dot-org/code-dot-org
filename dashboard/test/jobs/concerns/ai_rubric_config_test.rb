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
end
