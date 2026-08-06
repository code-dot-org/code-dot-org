require 'test_helper'

class AiStudentSnapshotHelperTest < ActiveSupport::TestCase
  setup do
    @student = create(:student)
    @teacher = create(:teacher)
    @section = create(:section, teacher: @teacher)
    @unit = create(:unit)
    @lesson_group = create(:lesson_group, script: @unit)
    @lesson = create(:lesson, script: @unit, lesson_group: @lesson_group)
    @level = create(:level)
    create(:script_level, script: @unit, lesson: @lesson, levels: [@level])
  end

  def stub_ai_response(method, content, usage: {})
    fake_response = mock
    fake_response.stubs(:code).returns(200)
    fake_response.stubs(:body).returns(
      {'choices' => [{'message' => {'content' => content}}], 'usage' => usage}.to_json
    )
    AiStudentSnapshotHelper::Client.any_instance.stubs(method).returns(fake_response)
  end

  # ---------------------------------------------------------------------------
  # max_user_level_updated_at
  # ---------------------------------------------------------------------------

  test 'max_user_level_updated_at returns nil when student has no user levels in the lesson' do
    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_nil result
  end

  test 'max_user_level_updated_at returns the updated_at of the student user level' do
    timestamp = 7.minutes.ago
    user_level = create(:user_level, user: @student, script: @unit, level: @level, updated_at: timestamp)

    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_equal user_level.updated_at, result
  end

  test 'max_user_level_updated_at returns the maximum across multiple user levels in the lesson' do
    level2 = create(:level)
    create(:script_level, script: @unit, lesson: @lesson, levels: [level2])

    older_timestamp = 20.minutes.ago
    newer_timestamp = 5.minutes.ago
    create(:user_level, user: @student, script: @unit, level: @level, updated_at: older_timestamp)
    newer_user_level = create(:user_level, user: @student, script: @unit, level: level2, updated_at: newer_timestamp)

    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_equal newer_user_level.updated_at, result
  end

  test 'max_user_level_updated_at ignores user levels from other lessons' do
    other_lesson = create(:lesson, script: @unit, lesson_group: @lesson_group)
    other_level = create(:level)
    create(:script_level, script: @unit, lesson: other_lesson, levels: [other_level])
    create(:user_level, user: @student, script: @unit, level: other_level, updated_at: 3.minutes.ago)

    result = AiStudentSnapshotHelper.max_user_level_updated_at(@unit.id, @lesson.id, @student.id)
    assert_nil result
  end

  # ---------------------------------------------------------------------------
  # should_generate_lesson_insight?
  # ---------------------------------------------------------------------------

  test 'returns true when insight is nil' do
    assert AiStudentSnapshotHelper.should_generate_lesson_insight?(nil, @unit.id, @lesson.id, @student.id)
  end

  test 'returns false when insight was updated within the cooldown window' do
    insight = build(:lesson_insight, updated_at: 1.minute.ago)
    refute AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end

  test 'returns false when insight is older than cooldown but no user levels exist' do
    insight = build(:lesson_insight, updated_at: 10.minutes.ago)
    refute AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end

  test 'returns false when insight is older than cooldown but no user level is newer than insight' do
    insight = build(:lesson_insight, updated_at: 10.minutes.ago)
    create(:user_level, user: @student, script: @unit, level: @level, updated_at: 15.minutes.ago)
    refute AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end

  test 'returns true when a user level was updated after the insight' do
    insight = build(:lesson_insight, updated_at: 10.minutes.ago)
    create(:user_level, user: @student, script: @unit, level: @level, updated_at: 6.minutes.ago)
    assert AiStudentSnapshotHelper.should_generate_lesson_insight?(insight, @unit.id, @lesson.id, @student.id)
  end

  # ---------------------------------------------------------------------------
  # generate_lesson_insight
  # ---------------------------------------------------------------------------

  test 'generate_lesson_insight returns only the whitelisted fields and traces the full model output' do
    prompt = {
      content: 'compiled insight prompt',
      prompt_name: 'teaching-assistant/student-snapshot/lesson-insight',
      prompt_version: 3,
      variables: {lesson_name: @lesson.name},
    }
    AiSystemPrompts::StudentSnapshotPromptHelper.stubs(:get_insight_system_prompt).returns(prompt)

    raw_content = {
      progress: 'Made steady progress',
      misconceptions: 'None observed',
      assessment: 'Assessment level completed correctly',
      next_steps: 'Move on to the next lesson',
      internal_debug_field: 'should never reach the FE',
    }.to_json
    stub_ai_response(:request_lesson_insight, raw_content, usage: {'prompt_tokens' => 10, 'completion_tokens' => 20})

    LangfuseHelper.expects(:trace_lesson_insight).with do |opts|
      opts[:variables] == prompt[:variables] &&
        opts[:prompt_name] == prompt[:prompt_name] &&
        opts[:prompt_version] == prompt[:prompt_version] &&
        opts[:output] == raw_content
    end

    result = AiStudentSnapshotHelper.generate_lesson_insight(@unit.id, @lesson.id, @teacher.id, @student.id, @section.id)

    assert_equal 200, result[:status]
    assert_equal(
      {
        'progress' => 'Made steady progress',
        'misconceptions' => 'None observed',
        'assessment' => 'Assessment level completed correctly',
        'next_steps' => 'Move on to the next lesson',
      },
      JSON.parse(result[:json])
    )
  end

  test 'generate_lesson_insight notifies Honeybadger and raises when the model response is not a JSON object' do
    AiSystemPrompts::StudentSnapshotPromptHelper.stubs(:get_insight_system_prompt).returns(
      content: 'compiled insight prompt', prompt_name: nil, prompt_version: nil, variables: {}
    )
    stub_ai_response(:request_lesson_insight, '"just a plain string"')
    LangfuseHelper.stubs(:trace_lesson_insight)

    Honeybadger.expects(:notify).with do |exception, opts|
      exception.is_a?(StandardError) && opts[:context][:lesson_id] == @lesson.id
    end

    assert_raises(StandardError) do
      AiStudentSnapshotHelper.generate_lesson_insight(@unit.id, @lesson.id, @teacher.id, @student.id, @section.id)
    end
  end

  test 'generate_lesson_insight notifies Honeybadger and raises when the AI response is not 200' do
    AiSystemPrompts::StudentSnapshotPromptHelper.stubs(:get_insight_system_prompt).returns(
      content: 'compiled insight prompt', prompt_name: nil, prompt_version: nil, variables: {}
    )
    fake_response = mock
    fake_response.stubs(:code).returns(500)
    fake_response.stubs(:body).returns('server error')
    AiStudentSnapshotHelper::Client.any_instance.stubs(:request_lesson_insight).returns(fake_response)

    Honeybadger.expects(:notify).with do |exception, opts|
      exception.is_a?(StandardError) && opts[:context][:status] == 500
    end

    assert_raises(StandardError) do
      AiStudentSnapshotHelper.generate_lesson_insight(@unit.id, @lesson.id, @teacher.id, @student.id, @section.id)
    end
  end

  # ---------------------------------------------------------------------------
  # generate_lesson_feedback
  # ---------------------------------------------------------------------------

  test 'generate_lesson_feedback returns only the whitelisted record fields and traces the full model output' do
    prompt = {
      content: 'compiled feedback prompt',
      prompt_name: 'teaching-assistant/student-snapshot/lesson-feedback',
      prompt_version: 2,
      variables: {lesson_name: @lesson.name},
    }
    AiSystemPrompts::StudentSnapshotPromptHelper.stubs(:get_feedback_system_prompt).returns(prompt)

    raw_content = {feedback: 'Great job on this lesson!'}.to_json
    stub_ai_response(:request_lesson_feedback, raw_content, usage: {'prompt_tokens' => 5, 'completion_tokens' => 15})

    LangfuseHelper.expects(:trace_lesson_feedback).with do |opts|
      opts[:variables] == prompt[:variables] &&
        opts[:prompt_name] == prompt[:prompt_name] &&
        opts[:prompt_version] == prompt[:prompt_version] &&
        opts[:output] == raw_content
    end

    result = AiStudentSnapshotHelper.generate_lesson_feedback(@unit.id, @lesson.id, @teacher.id, @student.id, @section.id)

    assert_equal 200, result[:status]
    record = result[:record]
    assert_equal 'Great job on this lesson!', record['saved_feedback']
    assert_equal AiStudentSnapshotHelper::LESSON_FEEDBACK_FIELDS.sort, record.keys.sort
  end

  test 'generate_lesson_feedback notifies Honeybadger and raises when the AI response is not 200' do
    AiSystemPrompts::StudentSnapshotPromptHelper.stubs(:get_feedback_system_prompt).returns(
      content: 'compiled feedback prompt', prompt_name: nil, prompt_version: nil, variables: {}
    )
    fake_response = mock
    fake_response.stubs(:code).returns(500)
    fake_response.stubs(:body).returns('server error')
    AiStudentSnapshotHelper::Client.any_instance.stubs(:request_lesson_feedback).returns(fake_response)

    Honeybadger.expects(:notify).with do |exception, opts|
      exception.is_a?(StandardError) && opts[:context][:status] == 500
    end

    assert_raises(StandardError) do
      AiStudentSnapshotHelper.generate_lesson_feedback(@unit.id, @lesson.id, @teacher.id, @student.id, @section.id)
    end
  end

  # ---------------------------------------------------------------------------
  # fetch_or_generate_lesson_insight
  # ---------------------------------------------------------------------------

  test 'fetch_or_generate_lesson_insight does not leak the system prompt for a freshly generated insight' do
    AiSystemPrompts::StudentSnapshotPromptHelper.stubs(:get_insight_system_prompt).returns(
      content: 'compiled insight prompt', prompt_name: nil, prompt_version: nil, variables: {}
    )
    stub_ai_response(:request_lesson_insight, {progress: 'ok', misconceptions: 'none', assessment: 'ok', next_steps: 'continue'}.to_json)
    LangfuseHelper.stubs(:trace_lesson_insight)

    result = AiStudentSnapshotHelper.fetch_or_generate_lesson_insight(@unit.id, @lesson.id, @teacher.id, @student.id, @section.id)

    assert_equal %i[status json updated_at].sort, result.keys.sort
  end
end
