require 'json'

class OpenaiEvaluateController < ApplicationController
  authorize_resource class: false

  API_KEY = CDO.openai_measures_of_learning_api_key
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  # POST /openai/evaluate
  def evaluate
    level_id = evaluate_params[:level_id]
    unit_id = evaluate_params[:unit_id]
    student_work = evaluate_params[:student_work]
    evaluation_type = evaluate_params[:evaluation_type]

    begin
      level = Level.find(level_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Level with id #{level_id}"
    end

    begin
      unit = Unit.find(unit_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Unit with id #{unit_id}"
    end

    # If the student did not do any work on the level, we don't need to send it to AI
    # for evaluation. Instead, return a custom response explaining why the student's
    # work was not evaluated.
    no_attempt_response = {
      aiEvaluation: "No attempt",
      evaluationCriteria: "Did the student attempt the level?",
    }

    if level.is_a?(FreeResponse) && student_work.delete(' ').empty?
      no_attempt_response[:aiReasoning] = "The student response was blank."
      # mimic the format of the response from AI
      json_response = {"content" => no_attempt_response.to_json}
      return render(status: :ok, json: json_response)
    elsif level.upper_grades_programming_level? && level.get_starter_code == student_work
      no_attempt_response[:aiReasoning] = "The student did not change the starter code."
      # mimic the format of the response from AI
      json_response = {"content" => no_attempt_response.to_json}
      return render(status: :ok, json: json_response)
    else
      system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(level, unit, evaluation_type)
      student_work_message = [{role: "user", content: student_work}]
      messages = prepend_system_prompt(system_prompt, student_work_message)
      response = client.request_evaluation(messages)
      response_body = JSON.parse(response.body)
      response_body = response_body['choices'][0]['message'] if response.code == 200
      evaluation =  {status: response.code, json: response_body}
      return render(status: evaluation[:status], json: evaluation[:json])
    end
  end

  private def evaluate_params
    params.transform_keys(&:underscore).permit(:level_id, :unit_id, :student_work, :evaluation_type)
  end

  private def client
    AiEvaluationOpenaiHelper::Client.new(API_KEY, MODEL)
  end

  private def prepend_system_prompt(system_prompt, messages)
    system_prompt_message = {
      content: system_prompt,
      role: "system"
    }

    messages.unshift(system_prompt_message)
    messages
  end
end
