class ProjectVersionsController < ApplicationController
  before_action :authenticate_user!

  # POST /project_versions
  def create
    _, storage_app_id = storage_decrypt_channel_id(params[:storage_id])
    project_version = ProjectVersion.new(storage_app_id: storage_app_id, object_version_id: params[:version_id], comment: params[:comment])
    if project_version.save
      return head :ok
    else
      return head :bad_request
    end
  end

  def get_token
    headers['csrf-token'] = form_authenticity_token
    return head :ok
  end
end
