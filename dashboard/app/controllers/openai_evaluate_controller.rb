class OpenaiEvaluateController < ApplicationController
  authorize_resource class: false

  API_KEY = CDO.openai_measures_of_learning_api_key
  MODEL = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION

  # POST /openai/evaluate
  def evaluate
    system_prompt = params[:systemPrompt]
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
