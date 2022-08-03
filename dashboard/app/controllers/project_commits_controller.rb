class ProjectCommitsController < ApplicationController
  before_action :authenticate_user!

  # POST /project_commits
  def create
    _, project_id = storage_decrypt_channel_id(params[:storage_id])
    project_commit = ProjectCommit.new(project_id: project_id, object_version_id: params[:version_id], comment: params[:comment])
    if project_commit.save
      return head :ok
    else
      return head :bad_request
    end
  end

  # GET /project_commits/get_token
  def get_token
    headers['csrf-token'] = form_authenticity_token
    return head :ok
  end

  # GET /project_commits/:channel_id
  def project_commits
    user_storage_id, project_id = storage_decrypt_channel_id(params[:channel_id])
    project_owner = User.find_by(id: user_id_for_storage_id(user_storage_id))
    return render :not_acceptable unless project_owner
    return render :forbidden unless can?(:view_project_commits, project_owner)
    commits = ProjectCommit.where(project_id: project_id).where.not(comment: '').order(created_at: :asc)
    commits = commits.map do |commit|
      {
        createdAt: commit.created_at,
        comment: commit.comment,
        projectVersion: commit.object_version_id
      }
    end
    render :ok, json: commits.to_json
  end
end
