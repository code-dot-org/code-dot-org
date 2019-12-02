require 'cdo/share_filtering'

class Api::V1::Projects::PersonalProjectsController < ApplicationController
  # GET /api/v1/projects/personal/
  def index
    return head :forbidden unless current_user
    render json: ProjectsList.fetch_personal_projects(current_user.id)
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end

  # GET /api/v1/projects/personal/check_name?new_name=NewName
  def check_name
    begin
      name_failure = ShareFiltering.find_name_failure(params[:new_name], locale)
    rescue OpenURI::HTTPError, IO::EAGAINWaitReadable => name_checking_error
      # If WebPurify or Geocoder fail, the name will be allowed, and we
      # retain the name_checking_error to log it below.
    end

    if name_checking_error
      # slog(
      #   tag: 'name_checking_error',
      #   error: "#{name_checking_error.class.name}: #{name_checking_error}",
      #   level_source_id: @level_source.id <-- what to use for a project? do I even need to log this?
      # )
    end

    if name_failure
      render json: {nameFailure: name_failure}, status: :success
    end
  end
end
