# frozen_string_literal: true

require 'base64'

class Api::V1::Certificates::CompletionsController < ApplicationController
  def show
    response.headers['Cache-Control'] = 'private, no-store'
    course_name = params[:course].present? ? Base64.urlsafe_decode64(params[:course]) : nil

    render json: Api::V1::Certificates::CompletionSerializer.new(current_user, course_name).as_json
  rescue ArgumentError
    render status: :bad_request, json: {
      code: 'invalid_course',
      message: 'course must be URL-safe base64',
    }
  end
end
