# The signed-in viewer's emoji reactions on a class gallery project, which is
# addressed by channel id. Behaves as ChallengeResponseReactionsController
# does for challenge responses: both actions are idempotent and return the
# project's updated tallies.
class ClassGalleryProjectReactionsController < ApplicationController
  before_action :authenticate_user!
  before_action :load_project

  # POST /class_gallery_projects/:class_gallery_project_channel_id/reactions {emoji}
  def create
    ProjectReaction.find_or_create_by!(project: @project, user: current_user, emoji: params.require(:emoji))
    render json: reactions_json
  rescue ActiveRecord::RecordInvalid => exception
    render status: :unprocessable_entity, json: {error: exception.message}
  end

  # DELETE /class_gallery_projects/:class_gallery_project_channel_id/reactions/:emoji
  def destroy
    ProjectReaction.where(project: @project, user: current_user, emoji: params[:emoji]).destroy_all
    render json: reactions_json
  end

  private def load_project
    @project = Project.find_by_channel_id(params[:class_gallery_project_channel_id])
    authorize! :react_in_class_gallery, @project
  end

  private def reactions_json
    {reactions: EmojiReactions.summarize(ProjectReaction.where(project: @project), current_user)}
  end
end
