module LangfuseHelper
  include LevelsHelper

  def self.fetch_tutor_prompt(prompt_name)
    wrap_response(tutor_client.fetch_prompt(prompt_name))
  end

  def self.fetch_ta_prompt(prompt_name, label: nil)
    wrap_response(ta_client.fetch_prompt(prompt_name, label: label))
  end

  def self.tutor_add_dataset_item(dataset_item)
    wrap_response(tutor_client.add_dataset_item(dataset_item))
  end

  # Sends a trace + generation to the TA Langfuse project for a lesson insight call.
  def self.trace_lesson_insight(**opts)
    trace_student_snapshot_call(trace_name: "lesson-insight", **opts)
  rescue => exception
    Rails.logger.warn("LangfuseHelper.trace_lesson_insight failed: #{exception.message}")
  end

  # Sends a trace + generation to the TA Langfuse project for a lesson feedback call.
  def self.trace_lesson_feedback(**opts)
    trace_student_snapshot_call(trace_name: "lesson-feedback", **opts)
  rescue => exception
    Rails.logger.warn("LangfuseHelper.trace_lesson_feedback failed: #{exception.message}")
  end

  # Input is keyed identifiers only; metadata carries the raw prompt variables rather
  # than the fully compiled system prompt, since prompt_name/prompt_version already
  # link the trace to the instructional template text itself.
  def self.trace_student_snapshot_call(trace_name:, model:, teacher_id:, lesson_id:, lesson_name:, unit_id:, unit_name:, section_id:, student_id:, variables:, output:, usage:, start_time:, end_time:, prompt_name: nil, prompt_version: nil)
    ta_client.create_trace_and_generation(
      trace_name: trace_name,
      generation_name: "llm-call",
      model: model,
      user_id: teacher_id&.to_s,
      input: {lesson_id: lesson_id, unit_id: unit_id, section_id: section_id},
      output: output,
      usage: {
        input: usage&.dig('prompt_tokens'),
        output: usage&.dig('completion_tokens'),
        unit: "TOKENS",
      },
      metadata: {
        lesson_id: lesson_id,
        lesson_name: lesson_name,
        unit_id: unit_id,
        unit_name: unit_name,
        section_id: section_id,
        student_id: student_id,
        teacher_id: teacher_id,
        variables: variables,
      },
      tags: [trace_name],
      start_time: start_time,
      end_time: end_time,
      prompt_name: prompt_name,
      prompt_version: prompt_version,
    )
  end

  def self.tutor_client
    LangfuseClientHelper::Client.new(CDO.tutor_langfuse_secret_key, CDO.tutor_langfuse_public_key)
  end

  def self.ta_client
    LangfuseClientHelper::Client.new(CDO.ta_langfuse_secret_key, CDO.ta_langfuse_public_key)
  end

  def self.wrap_response(response)
    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  private_class_method :tutor_client, :ta_client, :wrap_response, :trace_student_snapshot_call
end
