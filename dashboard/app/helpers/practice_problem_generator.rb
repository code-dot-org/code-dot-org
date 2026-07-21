# Generates candidate practice problems for a lesson with a dedicated OpenAI
# call. Deliberately independent of the AI Tutor (aichat) pipeline: its own
# prompt, key, model, and JSON handling, mirroring AiLessonSummariesHelper.
#
# Returns an array of candidate hashes (camelCase, no id/key) that the
# levelbuilder reviews and, on acceptance, POSTs to PracticeProblemsController
# to persist. Candidates are validated, coerced per type, and de-duplicated
# against the lesson's existing problems.
module PracticeProblemGenerator
  class OpenaiError < StandardError; end

  # A pinned OpenAI model; this call is intentionally separate from the aichat
  # model configuration.
  MODEL = 'gpt-4o-mini-2024-07-18'.freeze
  DEFAULT_COUNT = 5

  TYPES = SharedConstants::PRACTICE_PROBLEM_TYPES

  def self.generate(lesson:, count: DEFAULT_COUNT)
    response = client.request_completion(build_prompt(lesson, count))
    unless response.code == 200
      raise OpenaiError, "OpenAI returned #{response.code}: #{response.body}"
    end

    content = JSON.parse(response.body).dig('choices', 0, 'message', 'content')
    problems = JSON.parse(content.to_s)['problems'] || []
    normalize(problems, lesson)
  rescue JSON::ParserError => exception
    raise OpenaiError, "Could not parse OpenAI response: #{exception.message}"
  end

  def self.build_prompt(lesson, count)
    objectives = lesson.objectives.map {|o| "  - [id #{o.id}] #{o.description}"}
    vocabulary = lesson.vocabularies.map {|v| "  - #{v.word}: #{v.definition}"}
    existing = existing_problem_texts(lesson).map {|t| "  - #{t}"}
    overview = lesson.student_overview.presence || lesson.overview.presence || ''

    <<~PROMPT
      You are helping a curriculum author write #{count} formative practice
      problems that check whether a student understood the CS lesson titled
      "#{lesson.name}".

      Requirements:
        - Ground every problem in the lesson content and vocabulary below.
        - Use a VARIETY of problem types across the batch (do not make them all
          multiple choice); pick whichever type best fits each concept.
        - Do NOT repeat, verbatim or near-verbatim, any of the existing
          problems listed below.
        - Tag each problem with the id(s) of the objective(s) it targets,
          chosen only from the objectives listed below.

      Respond with a JSON object of the form:
        {"problems": [{"type": <type>, "problem_text": <string>,
          "objective_ids": [<objective id>, ...],
          "solution": [{"option": <string>, "correct": <value>}, ...]}]}

      The problem types and the meaning of each solution entry's "correct":
        - "#{TYPES[:MULTIPLE_CHOICE_SINGLE]}": choices; correct is true/false;
          exactly one is true.
        - "#{TYPES[:MULTIPLE_CHOICE_MULTI]}": choices; correct is true/false;
          one or more are true.
        - "#{TYPES[:MATCH]}": correct is the text this option pairs with.
        - "#{TYPES[:SORT]}": correct is the category this option belongs in.
        - "#{TYPES[:SCRAMBLE]}": correct is the 0-indexed position of this
          option in the correct order.

      Lesson overview:
      #{overview}

      Objectives:
      #{objectives.any? ? objectives.join("\n") : '  (none)'}

      Vocabulary:
      #{vocabulary.any? ? vocabulary.join("\n") : '  (none)'}

      Existing problems (do not duplicate these):
      #{existing.any? ? existing.join("\n") : '  (none)'}
    PROMPT
  end

  def self.existing_problem_texts(lesson)
    PracticeProblem.joins(:objectives).
      where(objectives: {lesson_id: lesson.id}).distinct.pluck(:problem_text)
  end

  # Validate and coerce the model output: keep only known types with a
  # non-empty question and solution, coerce `correct` per type, restrict
  # objective ids to the lesson's, and drop duplicate questions (against
  # existing problems and earlier problems in this batch).
  def self.normalize(problems, lesson)
    valid_types = TYPES.values
    valid_objective_ids = lesson.objectives.pluck(:id).to_set
    seen = existing_problem_texts(lesson).map {|t| normalize_text(t)}.to_set

    problems.filter_map do |problem|
      next unless problem.is_a?(Hash)

      type = problem['type']
      text = problem['problem_text'].to_s.strip
      next unless valid_types.include?(type)
      next if text.empty?

      key = normalize_text(text)
      next if seen.include?(key)

      solution = coerce_solution(type, problem['solution'])
      next if solution.empty?

      seen << key
      {
        problemType: type,
        problemText: text,
        solution: solution,
        objectiveIds: Array(problem['objective_ids']).map(&:to_i).
          select {|id| valid_objective_ids.include?(id)},
      }
    end
  end

  def self.coerce_solution(type, raw)
    return [] unless raw.is_a?(Array)

    raw.filter_map do |entry|
      # Accept the documented {option, correct} object shape, and also salvage
      # a two-element [option, correct] array if the model returns that.
      option, correct =
        if entry.is_a?(Hash)
          [entry['option'], entry['correct']]
        elsif entry.is_a?(Array) && entry.size == 2
          entry
        end
      next if option.nil?

      option = option.to_s
      next if option.empty?

      coerced =
        case type
        when TYPES[:MULTIPLE_CHOICE_SINGLE], TYPES[:MULTIPLE_CHOICE_MULTI]
          truthy?(correct)
        when TYPES[:SCRAMBLE]
          correct.to_i
        else # match, sort
          correct.to_s
        end
      {'option' => option, 'correct' => coerced}
    end
  end

  def self.truthy?(value)
    value == true || value.to_s.strip.downcase == 'true'
  end

  def self.normalize_text(text)
    text.to_s.strip.downcase.gsub(/\s+/, ' ')
  end

  class Client
    OPEN_AI_URL = 'https://api.openai.com/v1/chat/completions'.freeze

    def initialize(api_key, model)
      @api_key = api_key
      @model = model
    end

    def request_completion(prompt)
      HTTParty.post(
        OPEN_AI_URL,
        headers: {
          'Content-Type' => 'application/json',
          'Authorization' => "Bearer #{@api_key}",
        },
        body: {
          model: @model,
          messages: [{role: 'system', content: prompt}],
          response_format: {type: 'json_object'},
          temperature: 0.7,
        }.to_json,
        open_timeout: DCDO.get('openai_http_open_timeout', 5),
        read_timeout: DCDO.get('openai_http_read_timeout', 60)
      )
    end
  end

  def self.client
    # Reuses the curriculum-content OpenAI key. This call is deliberately
    # independent of the AI Tutor (aichat) request pipeline.
    Client.new(CDO.openai_lesson_summaries_api_key, MODEL)
  end
end
