require 'json'

class StudentWorkEvaluationsController < ApplicationController
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :student_work_evaluation

  # POST /student_work_evaluations
  def create
    @student_work_evaluation = StudentWorkEvaluation.new(student_work_evaluation_params)
    if @student_work_evaluation.save
      render(status: :created, json: {message: "Successfully created #{@student_work_evaluation.type}.", id: @student_work_evaluation.id})
    else
      render(status: :not_acceptable, json: {error: @student_work_evaluation.errors.full_messages})
    end
  end

  # GET /student_work_evaluations/:userId/:levelId/:unitId
  def get_most_recent_user_level_evaluation
    user_id = params[:user_id]
    level_id = params[:level_id]
    unit_id = params[:unit_id]

    evaluations = UserLevelEvaluation.where(
      student_id: user_id,
      level_id: level_id,
      unit_id: unit_id
    )

    return head :ok if evaluations.empty?

    # It is possible that there might be more than one evaluation for a student on a level/unit,
    # so we will return the most recent one
    last_evaluation = evaluations.order(created_at: :desc).first
    return head :not_found unless last_evaluation

    transformed_evaluation = last_evaluation.as_json.deep_transform_keys {|k| k.camelize(:lower)}
    render json: transformed_evaluation, status: :ok
  end

  def student_work_evaluation_params
    student_work_evaluation_params = params.transform_keys(&:underscore).permit(
      :type,
      :student_id,
      :requester_id,
      :level_id,
      :unit_id,
      :evaluator,
      :section_id,
      :evaluation_criteria,
      :evaluation,
      :reasoning,
      :ai_model_version,
      :code_version,
      :skill_id
    )
    student_work_evaluation_params[:requester_id] = current_user.id
    student_work_evaluation_params[:school_year] = school_year
    student_work_evaluation_params[:ai_model_version] = SharedConstants::EVALUATE_STUDENT_LEARNING_MODEL_VERSION
    student_work_evaluation_params
  end
end
