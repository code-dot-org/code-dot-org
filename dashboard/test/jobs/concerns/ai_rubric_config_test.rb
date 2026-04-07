require 'test_helper'

class AiRubricConfigTest < ActiveSupport::TestCase
  setup do
    @script_level = create(:script_level)
    @unit = @script_level.script
    @level = @script_level.level
    @lesson = @script_level.lesson
  end

  test 'get_lesson_s3_name returns S3 name from rubric s3_config_dir' do
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
    create(:rubric, lesson: @lesson, level: @level, s3_config_dir: 'test-lesson-L1')

    assert AiRubricConfig.ai_enabled?(@script_level)
  end

  test 'ai_enabled? returns false when no rubric exists' do
    refute AiRubricConfig.ai_enabled?(@script_level)
  end
end
