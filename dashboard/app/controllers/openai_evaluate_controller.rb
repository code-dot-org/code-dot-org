class OpenaiEvaluateController < ApplicationController
  authorize_resource class: false

  API_KEY = CDO.openai_measures_of_learning_api_key
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  # POST /openai/evaluate
  def evaluate
    level_id = params[:levelId]
    unit_id = params[:unitId]
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

    evaluation_type = params[:evaluationType]
    system_prompt = AiSystemPrompts::EvaluateSystemPromptHelper.get_system_prompt(level, unit, evaluation_type)
    student_work = prepend_system_prompt(system_prompt, params[:studentWork])
    response = client.request_evaluation(student_work)
    response_body = JSON.parse(response.body)
    response_body = response_body['choices'][0]['message'] if response.code == 200
    evaluation =  {status: response.code, json: response_body}
    return render(status: evaluation[:status], json: evaluation[:json])
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
