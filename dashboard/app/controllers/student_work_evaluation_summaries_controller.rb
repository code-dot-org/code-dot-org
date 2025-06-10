require 'json'

class StudentWorkEvaluationSummariesController < ApplicationController
  include Rails.application.routes.url_helpers
  before_action :authenticate_user!
  load_and_authorize_resource :student_work_evaluation_summary

  def create
    @student_work_evaluation_summary = StudentWorkEvaluationSummary.new(student_work_evaluation_summary_params)
    if @student_work_evaluation_summary.save
      render(status: :created, json: {message: "Successfully created StudentWorkEvaluationSummary.", id: @student_work_evaluation_summary.id})
    else
      render(status: :not_acceptable, json: {error: @student_work_evaluation_summary.errors.full_messages})
    end
  end

  def student_work_evaluation_summary_params
    student_work_evaluation_summary_params = params.transform_keys(&:underscore).permit(
      :student_work_evaluation_id,
      :student_work_evaluation_summary_id,
    )
    student_work_evaluation_summary_params
  end
end
