require 'json'

class OpenaiEvaluateController < ApplicationController
  authorize_resource class: false
  # Need to modify this... modify abilities.rb?
  skip_authorization_check only: [:match_teaching_profile]

  # POST /openai/evaluate
  def evaluate
    level_id = evaluate_params[:level_id]
    student_work = evaluate_params[:student_work]
    evaluation_type = evaluate_params[:evaluation_type]
    should_evaluate_skills = evaluate_params[:should_evaluate_skills] || false

    begin
      level = Level.find(level_id)
    rescue ActiveRecord::RecordNotFound
      return render status: :not_found, json: "Level with id #{level_id}"
    end

    response = OpenaiEvaluateHelper.evaluate(
      level,
      student_work: student_work,
      evaluation_type: evaluation_type,
      should_evaluate_skills: should_evaluate_skills
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

  # POST /openai/match_teaching_profile
  def match_teaching_profile
    teaching_profile_data = match_teaching_profile_params[:teaching_profile_data]

    unless teaching_profile_data
      return render status: :bad_request, json: {error: "Missing teaching_profile_data"}
    end

    response = OpenaiEvaluateHelper.match_teaching_profile(teaching_profile_data)

    return render(status: response[:status], json: response[:json])
  end

  private def evaluate_params
    params.transform_keys(&:underscore).permit(:level_id, :unit_id, :student_work, :evaluation_type, :should_evaluate_skills)
  end

  private def evaluate_section_params
    params.transform_keys(&:underscore).permit(:unit_name, :section_id)
  end

  private def match_teaching_profile_params
    params.permit(:teaching_profile_data => {})
  end
end
