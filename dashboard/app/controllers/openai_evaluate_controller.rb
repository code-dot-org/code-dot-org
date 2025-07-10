require 'json'

class OpenaiEvaluateController < ApplicationController
  authorize_resource class: false

  # POST /openai/evaluate
  def evaluate
    level_id = evaluate_params[:level_id]
    student_work = evaluate_params[:student_work]
    evaluation_type = evaluate_params[:evaluation_type]

    begin
      level = Level.find(level_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Level with id #{level_id}"
    end

    response = OpenaiEvaluateHelper.evaluate(
      level,
      student_work: student_work,
      evaluation_type: evaluation_type
    )

    return render(status: response[:status], json: response[:json])
  end

  # POST /openai/evaluate_section
  def evaluate_section
    section = Section.find(evaluate_section_params[:section_id])
    authorize! :manage, section

    begin
      unit = Unit.find_by(name: evaluate_section_params[:unit_name])
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Unit with name #{evaluate_section_params[:unit_name]}"
    end

    OpenaiEvaluateHelper.evaluate_section(
      unit,
      section,
    )

    head :no_content
  end

  private def evaluate_params
    params.transform_keys(&:underscore).permit(:level_id, :unit_id, :student_work, :evaluation_type)
  end

  private def evaluate_section_params
    params.transform_keys(&:underscore).permit(:unit_name, :section_id)
  end
end
