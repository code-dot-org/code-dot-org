require 'json'

class OpenaiEvaluateController < ApplicationController
  authorize_resource class: false

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

    response = OpenaiEvaluateHelper.evaluate(
      level,
      unit,
      student_work: student_work,
      evaluation_type: evaluation_type
    )

    return render(status: response[:status], json: response[:json])
  end

  private def evaluate_params
    params.transform_keys(&:underscore).permit(:level_id, :unit_id, :student_work, :evaluation_type)
  end
end
