# Builds the OpenAI request pieces for evaluating a student's challenge
# response against its challenge's rubric: the chat messages (system prompt
# from the challenge question and rubric, user message from the student's
# text, transcript, and whiteboard images) and the structured-output schema
# the model must answer in.
#
# A rubric is stored on Challenge#rubric as JSON shaped like:
#   {"criteria" => [{"key" => ..., "description" => ...,
#                    "scale" => [{"level" => ..., "description" => ...}]}]}
module ChallengeEvaluationPromptHelper
  # The full messages array for the chat completions API: a system message
  # describing the evaluator role, challenge, and rubric, then a user message
  # carrying the student's work.
  def self.messages(challenge_response)
    [
      {role: 'system', content: system_prompt(challenge_response.challenge)},
      {role: 'user', content: user_content(challenge_response)},
    ]
  end

  def self.system_prompt(challenge)
    <<~PROMPT
      You are an experienced K-12 computer science teacher evaluating a student's response to a challenge question. The student may have answered in writing, by speaking (you will receive a transcript), by drawing on a whiteboard (you will receive images), or a combination of these.

      Evaluate the response against each criterion of the rubric below. For each criterion, choose the scale level that best matches the student's work, and explain your reasoning with specific evidence from the response. Judge only what the student actually communicated; do not give credit for ideas that are not present. Use language appropriate for a teacher reviewing the evaluation.

      Separately, write feedback addressed directly to the student: first describe what they did well, then what they could do to improve, grounded in the rubric criteria. This feedback goes to the student, so never mention scores, levels, grades, or the rubric itself in it, and use encouraging language a K-12 student can understand.

      Challenge question:
      #{challenge.question}

      Rubric:
      #{rubric_text(challenge.rubric)}
    PROMPT
  end

  # The user-turn content array: labeled text parts for the student's written
  # response and transcript, plus one image part per uploaded whiteboard
  # image. Video and audio assets are omitted; the transcript stands in for
  # them.
  def self.user_content(challenge_response)
    content = []
    if challenge_response.student_text.present?
      content << {type: 'text', text: "Student's written response:\n#{challenge_response.student_text}"}
    end
    if challenge_response.transcript.present?
      content << {type: 'text', text: "Transcript of the student's spoken response:\n#{challenge_response.transcript}"}
    end
    challenge_response.challenge_response_assets.select(&:asset_whiteboard_image?).each do |asset|
      next unless asset.uploaded?
      bytes = asset.download_bytes
      # Whiteboard images are always PNG (enforced at upload time).
      data_uri = "data:image/png;base64,#{Base64.strict_encode64(bytes)}"
      content << {type: 'image_url', image_url: {url: data_uri}}
    end
    content
  end

  # The response_format param forcing the model to return one evaluation per
  # rubric criterion. The criterion keys are baked into the schema as an enum
  # so the model cannot skip or invent criteria.
  def self.response_format(challenge)
    keys = criteria(challenge.rubric).map {|criterion| criterion['key']}
    raise ArgumentError, "challenge #{challenge.id} has no rubric criteria" if keys.empty?
    {
      type: 'json_schema',
      json_schema: {
        name: 'challenge_evaluation',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            evaluations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  key: {type: 'string', enum: keys},
                  level: {type: 'string'},
                  reasoning: {type: 'string'},
                  evidence: {type: 'string'},
                },
                required: %w[key level reasoning evidence],
                additionalProperties: false,
              },
            },
            student_feedback: {type: 'string'},
          },
          required: %w[evaluations student_feedback],
          additionalProperties: false,
        },
      },
    }
  end

  def self.criteria(rubric)
    (rubric || {}).fetch('criteria', [])
  end

  # Renders the rubric criteria and their scale levels as an indented list.
  def self.rubric_text(rubric)
    criteria(rubric).map do |criterion|
      lines = ["- #{criterion['key']}: #{criterion['description']}"]
      (criterion['scale'] || []).each do |level|
        lines << "  - #{level['level']}: #{level['description']}"
      end
      lines.join("\n")
    end.join("\n")
  end
end
