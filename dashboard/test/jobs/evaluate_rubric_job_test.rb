require "test_helper"

class EvaluateRubricJobTest < ActiveJob::TestCase
  test "job succeeds on ai-enabled level" do
    user = create :user
    script_level = create :script_level
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(script_level).returns('fake-lesson-s3-name')

    perform_enqueued_jobs do
      EvaluateRubricJob.perform_later(user_id: user.id, script_level_id: script_level.id)
    end
  end

  test "job fails on non-ai level" do
    user = create :user
    script_level = create :script_level
    EvaluateRubricJob.stubs(:get_lesson_s3_name).with(script_level).returns(nil)

    exception = assert_raises RuntimeError do
      EvaluateRubricJob.new.perform(user_id: user.id, script_level_id: script_level.id)
    end
    assert_includes exception.message, 'lesson_s3_name not found'
  end
end
