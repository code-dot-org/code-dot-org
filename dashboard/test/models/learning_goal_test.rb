require 'test_helper'

class LearningGoalTest < ActiveSupport::TestCase
  test 'generates key on create if one isnt present' do
    learning_goal = create(:learning_goal, key: nil)
    learning_goal.reload
    assert learning_goal.key.present?
  end

  test 'does not generate key on create if one is present' do
    learning_goal = create(:learning_goal, key: 'intentionally-present-key')
    learning_goal.reload
    assert_equal 'intentionally-present-key', learning_goal.key
  end

  test 'validate_ai_config passes for non-ai-enabled learning goal' do
    learning_goal = build(:learning_goal, ai_enabled: false)
    assert learning_goal.valid?
  end

  test 'validate_ai_config passes for ai-enabled learning goal with valid S3 config' do
    lesson = create(:lesson, :with_lesson_group)
    level = create(:level)
    create(:script_level, script: lesson.script, lesson: lesson, levels: [level])
    rubric = create(:rubric, lesson: lesson, level: level)

    AiRubricConfig.stubs(:get_lesson_s3_name).returns('fake-lesson-s3-name')
    stub_lesson_s3_data

    learning_goal = build(:learning_goal, rubric: rubric, learning_goal: 'ai-configured learning goal 1', ai_enabled: true)
    assert learning_goal.valid?, "Expected learning goal to be valid, got errors: #{learning_goal.errors.full_messages}"
  end

  test 'validate_ai_config fails for ai-enabled learning goal without valid S3 config' do
    lesson = create(:lesson, :with_lesson_group)
    level = create(:level)
    create(:script_level, script: lesson.script, lesson: lesson, levels: [level])
    rubric = create(:rubric, lesson: lesson, level: level)

    AiRubricConfig.stubs(:get_lesson_s3_name).returns('fake-lesson-s3-name')
    stub_lesson_s3_data

    learning_goal = build(:learning_goal, rubric: rubric, learning_goal: 'non-configured learning goal', ai_enabled: true)
    refute learning_goal.valid?
    assert_includes learning_goal.errors[:learning_goal].first, 'no valid AI config in S3'
  end

  test 'validate_ai_config is skipped when aws_s3_emulated is true' do
    CDO.stubs(:aws_s3_emulated).returns(true)

    learning_goal = build(:learning_goal, ai_enabled: true)
    assert learning_goal.valid?
  end

  test 'validate_ai_config fails when get_lesson_s3_name returns nil' do
    lesson = create(:lesson, :with_lesson_group)
    level = create(:level)
    create(:script_level, script: lesson.script, lesson: lesson, levels: [level])
    rubric = create(:rubric, lesson: lesson, level: level)

    AiRubricConfig.stubs(:get_lesson_s3_name).returns(nil)
    AiRubricConfig.stubs(:get_s3_learning_goals).with(nil).returns([])

    learning_goal = build(:learning_goal, rubric: rubric, learning_goal: 'some learning goal', ai_enabled: true)
    refute learning_goal.valid?
    assert_includes learning_goal.errors[:learning_goal].first, 'no valid AI config in S3'
  end

  private def stub_lesson_s3_data
    s3_client = Aws::S3::Client.new(stub_responses: true)
    AiRubricConfig.stubs(:s3_client).returns(s3_client)

    fake_rubric_csv = <<~CSV
      Key Concept,Extensive Evidence,Convincing Evidence,Limited Evidence,No Evidence
      ai-configured learning goal 1,abc,def,ghi,jkl
      ai-configured learning goal 2,abc,def,ghi,jkl
      ai-configured learning goal 3,abc,def,ghi,jkl
    CSV

    path_prefix = AiRubricConfig::S3_AI_RELEASE_PATH
    bucket = {
      "#{path_prefix}fake-lesson-s3-name/standard_rubric.csv" => fake_rubric_csv,
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
