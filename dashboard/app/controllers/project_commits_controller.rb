class ProjectCommitsController < ApplicationController
  before_action :authenticate_user!

  # POST /project_commits
  def create
    _, project_id = storage_decrypt_channel_id(params[:storage_id])
    # Use find_or_initialize_by to detect if this is a duplicate submission.
    project_commit = ProjectCommit.find_or_initialize_by(
      project_id: project_id,
      object_version_id: params[:version_id]
    )

    if project_commit.persisted?
      # This is a duplicate submission - a comment for this project version already exists.
      # Notify Honeybadger about the duplicate submission and do not overwrite the existing comment.
      Honeybadger.notify(
        'Duplicate project commit submission detected.',
        context: {
          project_id: project_id,
          object_version_id: params[:version_id],
          existing_comment: project_commit.comment,
          attempted_comment: params[:comment],
          user_id: current_user&.id
        }
      )
      render json: {error: 'A comment already exists for this project version.'}, status: :conflict
      return
    else
      # New record - set the comment and save.
      project_commit.comment = params[:comment]
      project_commit.save!
    end

    return head :ok
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
