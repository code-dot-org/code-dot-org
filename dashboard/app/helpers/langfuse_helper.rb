module LangfuseHelper
  include LevelsHelper

  def self.fetch_prompt(prompt_name)
    response = client.fetch_prompt(prompt_name)

    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  def self.tutor_add_dataset_item(dataset_item)
    response = tutor_client.add_dataset_item(dataset_item)

    if response.code == 200
      {status: :ok, json: JSON.parse(response.body)}
    else
      {status: response.code, json: {error: response.body}}
    end
  end

  # Sends a trace + generation to the TA Langfuse project for a lesson insight call.
  # Input is keyed identifiers only (not the system prompt) to avoid logging student data.
  def self.trace_lesson_insight(model:, teacher_id:, lesson_id:, unit_id:, section_id:, student_id:, snap_shot_prompt:, output:, usage:, start_time:, end_time:)
    ta_client.create_trace_and_generation(
      trace_name: "lesson-insight",
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
        unit_id: unit_id,
        section_id: section_id,
        student_id: student_id,
        teacher_id: teacher_id,
        snap_shot_prompt: snap_shot_prompt,
      },
      tags: ["lesson-insight"],
      start_time: start_time,
      end_time: end_time,
    )
  rescue => exception
    Rails.logger.warn("LangfuseHelper.trace_lesson_insight failed: #{exception.message}")
  end

  def self.tutor_client
    LangfuseClientHelper::Client.new(CDO.tutor_langfuse_secret_key, CDO.tutor_langfuse_public_key)
  end

  def self.ta_client
    LangfuseClientHelper::Client.new(CDO.ta_langfuse_secret_key, CDO.ta_langfuse_public_key)
  end

  private_class_method :tutor_client, :ta_client
end
