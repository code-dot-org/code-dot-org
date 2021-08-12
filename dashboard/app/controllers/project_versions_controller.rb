class ProjectVersionsController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :authenticate_user!
  before_action :decrypt_channel_id, only: [:create, :project_comments]

  # POST /project_versions
  def create
    project_version = ProjectVersion.new(storage_app_id: @storage_app_id, object_version_id: params[:version_id], comment: params[:comment])
    if project_version.save
      return head :ok
    else
      return head :bad_request
    end
  end
end
