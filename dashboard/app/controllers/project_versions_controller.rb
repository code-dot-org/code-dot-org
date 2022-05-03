class ProjectVersionsController < ApplicationController
  # POST /project_versions
  def create
    user_storage_id, project_id = storage_decrypt_channel_id(params[:storage_id])
    project_owner = User.find_by(id: user_id_for_storage_id(user_storage_id))
    return render :forbidden unless can?(:create, project_owner, project_id)
    project_version = ProjectVersion.new(project_id: project_id, object_version_id: params[:version_id], comment: params[:comment])
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

  def project_commits
    user_storage_id, project_id = storage_decrypt_channel_id(params[:channel_id])
    project_owner = User.find_by(id: user_id_for_storage_id(user_storage_id))
    return render :not_acceptable unless project_owner
    return render :forbidden unless can?(:project_commits, project_owner, project_id)
    commits = ProjectVersion.where(project_id: project_id).order(created_at: :desc)
    commits = commits.map do |commit|
      {
        createdAt: commit.created_at,
        comment: commit.comment,
        projectVersion: commit.object_version_id,
        isVersionExpired: commit.created_at < 1.year.ago
      }
    end
    render :ok, json: commits.to_json
  end
end
