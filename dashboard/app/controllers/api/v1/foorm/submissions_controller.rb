require 'json_value'

class Api::V1::Foorm::SubmissionsController < ApplicationController
  # POST /dashboardapi/v1/foorm/submissions
  def create
    answers = serialize params[:answers], JSON
    form_name = params[:form_name]
    form_version = params[:form_version]
    submission = ::Foorm::Submission.new(form_name: form_name, form_version: form_version, answers: answers)
    submission.save!

    render json: {submission_id: submission.id}, status: :created
  end
end
