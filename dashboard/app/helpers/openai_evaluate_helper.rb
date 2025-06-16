module OpenaiEvaluateHelper
  API_KEY = CDO.openai_measures_of_learning_api_key
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  # If the student did not do any work on the level, we don't need to send it to AI
  # for evaluation. Instead, return a custom response explaining why the student's
  # work was not evaluated.
  NO_ATTEMPT_RESPONSE = {
    aiEvaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:NO_ATTEMPT],
    evaluationCriteria: "Did the student attempt the level?",
  }

  PROFANITY_DETECTED_RESPONSE = {
    aiEvaluation:  SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:STUDENT_PROFANITY],
    evaluationCriteria: "Did the student use profanity?",
    aiReasoning: "The response contains profanity and could not be evaluated.",
  }

  PII_DETECTED_RESPONSE = {
    aiEvaluation: SharedConstants::STUDENT_WORK_EVALUATION_STATUS[:STUDENT_PII],
    evaluationCriteria: "Does the student work contain personally identifying information?",
    aiReasoning: "The response could not be evaluated because it contains personal information that is not safe for your student to share.",
  }

  DUMMY_RESPONSE = {
    aiEvaluation: "Ok",
    evaluationCriteria: "This is a test environment, so no real AI call was made.",
    aiReasoning: "Dummy data returned for testing purposes."
  }

  def self.evaluate(level, unit, options)
    student_work = options[:student_work]
    evaluation_type = options[:evaluation_type]

    if level.is_a?(FreeResponse) && student_work.delete(' ').empty?
      response = {**NO_ATTEMPT_RESPONSE, aiReasoning: "The student response was blank."}
      # mimic the format of the response from AI
      json_response = {"content" => response.to_json}
      return {status: :ok, json: json_response}
    elsif level.upper_grades_programming_level? && level.get_starter_code == student_work
      response = {**NO_ATTEMPT_RESPONSE, aiReasoning: "The student did not change the starter code."}

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
      system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(level, unit, evaluation_type)
      student_work_message = [{role: "user", content: student_work}]
      messages = prepend_system_prompt(system_prompt, student_work_message)
      response = client.request_evaluation(messages)
      response_body = JSON.parse(response.body)
      response_body = response_body['choices'][0]['message'] if response.code == 200
      evaluation =  {status: response.code, json: response_body}
      return {status: evaluation[:status], json: evaluation[:json]}
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

  private_class_method :client, :prepend_system_prompt
end
