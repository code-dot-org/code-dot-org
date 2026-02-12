class AidiffArtifactsController <ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource except: [:create]

  def create
    section_ids = params[:sectionIds].filter do |id|
      current_user.sections_instructed.any? {|section| id.to_i == section.id}
    end

    message = AidiffMessage.find(params[:messageId])
    authorize! :manage, message

    unless message.is_artifact_candidate
      return head :bad_request
    end

    unit_id = params[:unitId]
    lesson_id = params[:lessonId].to_i

    @artifact = AidiffArtifact.create(
      type: message.artifact_candidate_type,
      aidiff_thread: message.aidiff_thread,
      content: JSON::Validator.parse(message.content),
      user: current_user,
      aidiff_artifact_associations_attributes: section_ids.map do |id|
        {
          unit_id: unit_id,
          lesson_id: lesson_id,
          section_id: id.to_i,
          association_type: SharedConstants::AI_DIFF_ASSOCIATION[:LESSON]
        }
      end
    )

    render json: @artifact.summarize
  rescue StandardError => exception
    return render status: :bad_request, json: {error: exception.message}
  end

  def index
    render json: @aidiff_artifacts&.map(&:summarize)
  end

  private def validate_params
    params.permit(
      :title,
      :aidiff_thread_id,
      aidiff_artifact_associations_attributes: [
        :id,
        :association_type,
        :lesson_id,
        :unit_id,
        :unit_group_id,
        :section_id,
        :_destroy,
      ],
      content: {}
    )
  end
end
