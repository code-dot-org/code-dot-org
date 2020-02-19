require 'json_value'

class Api::V1::Forrm::SubmissionsController < ApplicationController
  # POST /dashboardapi/v1/forrm/submissions
  def create
    answers = serialize params[:answers], JSON
    form_name = params[:form_name]
    form_version = params[:form_version]
    submission = ::Forrm::Submission.new(form_name: form_name, form_version: form_version, answers: answers)
    submission.save!

    render json: {submission_id: submission.id}, status: :created
  end
end
