module OpenaiEvaluateHelper
  include LevelsHelper

  API_KEY = CDO.openai_measures_of_learning_api_key
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  # There are a few special cases where we want skip sending the student work to AI
  # and instead return a custom response that mimics the format of the response from AI.
  NO_ATTEMPT_RESPONSE = {
    aiEvaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NOT_EVALUATED],
    evaluationCriteria: "Did the student attempt the level?",
    aiReasoning: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NO_ATTEMPT],
  }

  PROFANITY_DETECTED_RESPONSE = {
    aiEvaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NOT_EVALUATED],
    evaluationCriteria: "Did the student use profanity?",
    aiReasoning: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:STUDENT_PROFANITY],
  }

  PII_DETECTED_RESPONSE = {
    aiEvaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NOT_EVALUATED],
    evaluationCriteria: "Does the student work contain personally identifying information?",
    aiReasoning: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:STUDENT_PII]
  }

  DUMMY_RESPONSE = {
    aiEvaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:PARTIAL_COMPLETE_CORRECT],
    evaluationCriteria: "This is a test environment, so no real AI call was made.",
    aiReasoning: "Dummy data returned for testing purposes."
  }

  def self.evaluate(level, options)
    student_work = options[:student_work]
    evaluation_type = options[:evaluation_type]

    if (level.is_a?(FreeResponse) && student_work.delete(' ').empty?) || (level.upper_grades_programming_level? && level.get_starter_code == student_work)
      response = NO_ATTEMPT_RESPONSE
      # mimic the format of the response from AI
      json_response = {"content" => response.to_json}
      return {status: :ok, json: json_response}
    elsif ProfanityFilter.find_potential_profanity(student_work, "en", {})
      json_response = {"content" => PROFANITY_DETECTED_RESPONSE.to_json}
      return {status: :ok, json: json_response}
    elsif ShareFiltering.find_pii_failure(student_work)
      json_response = {"content" => PII_DETECTED_RESPONSE.to_json}
      return {status: :ok, json: json_response}
    elsif Rails.env.test?
      # Return dummy data in the test environment
      json_response = {"content" => DUMMY_RESPONSE.to_json}
      return {status: :ok, json: json_response}
    else
      system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(level, evaluation_type)
      student_work_message = [{role: "user", content: student_work}]
      messages = prepend_system_prompt(system_prompt, student_work_message)
      response = client.request_evaluation(messages)
      response_body = JSON.parse(response.body)
      response_body = response_body['choices'][0]['message'] if response.code == 200
      evaluation =  {status: response.code, json: response_body}
      return {status: evaluation[:status], json: evaluation[:json]}
    end
  end

  def self.evaluate_section(unit, section)
    students = section.students

    levels = unit.levels

    user_levels = UserLevel.joins(:user, :level).
                          where(user: students, level: levels, script: unit).
                          includes(:user, :level, :level_source)

    user_levels.each do |user_level|
      if user_level.level_source && user_level.level_source.data.present?
        evaluate_free_response(user_level, unit)
      elsif user_level.level.name == 'U4 L03 Variables operator practice 5_2024' || user_level.level.name == 'U4 L03 Variables numbers practice 4_2024'
        evaluate_code_level(user_level, unit)
      end
    end

    nil
  end

  def self.evaluate_free_response(user_level, unit)
    student_work = user_level.level_source.data

    response = evaluate(
      user_level.level,
      student_work: student_work,
      evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT]
    )

    create_ai_evaluations_from_ai_response(user_level.user, user_level, unit, response, {})
  end

  def self.evaluate_code_level(user_level, unit)
    helper = ApplicationController.helpers
    student_code = helper.get_student_code(user_level.user.id, user_level.level, unit.id)

    unless student_code.nil? || student_code[:student_code].nil?
      response = evaluate(user_level.level, student_work: student_code[:student_code], evaluation_type: SharedConstants::AI_EVALUATION_TYPES[:SINGLE_STUDENT])

      create_ai_evaluations_from_ai_response(user_level.user, user_level, unit, response, code_version: student_code[:code_version])
    end
  end

  def self.create_ai_evaluations_from_ai_response(student, user_level, unit, ai_response, options)
    parsed_evaluation = JSON.parse(ai_response[:json]['content'])

    student_work_evaluation_params = {
      type: 'UserLevelEvaluation',
      student_id: user_level.user.id,
      code_version: options[:code_version] || nil,
      level_id: user_level.level.id,
      unit_id: unit.id,
      evaluator: 'AI',
      evaluation_criteria: parsed_evaluation['evaluationCriteria'],
      evaluation: parsed_evaluation['aiEvaluation'],
      reasoning: parsed_evaluation['aiReasoning'],
      requester_id: current_user&.id || nil,
      school_year: '2024-25',
      ai_model_version: SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION
    }

    work_evaluation = StudentWorkEvaluation.create!(student_work_evaluation_params)

    skill_evaluations = parsed_evaluation['skillEvaluations']
    skill_evaluations&.each do |skill_evaluation|
      skill_evaluation_params = {
        type: 'UserLevelSkillEvaluation',
        student_id: user_level.user.id,
        code_version: options[:code_version] || nil,
        level_id: user_level.level.id,
        unit_id: unit.id,
        evaluator: 'AI',
        evaluation_criteria: skill_evaluation['evaluationCriteria'],
        evaluation: skill_evaluation['aiEvaluation'],
        reasoning: skill_evaluation['aiReasoning'],
        skill_id: skill_evaluation['skillId'],
      }

      created_skill_evaluation = StudentWorkEvaluation.create!(skill_evaluation_params)

      summary_params = {student_work_evaluation_id: created_skill_evaluation.id,
        student_work_evaluation_summary_id: work_evaluation.id}

      StudentWorkEvaluationSummary.create!(summary_params)
    end
  end

  def self.client
    AiEvaluationOpenaiHelper::Client.new(API_KEY, MODEL)
  end

  def self.prepend_system_prompt(system_prompt, messages)
    system_prompt_message = {
      content: system_prompt,
      role: "system"
    }

    messages.unshift(system_prompt_message)
    messages
  end

  private_class_method :client, :prepend_system_prompt, :evaluate_free_response
end
