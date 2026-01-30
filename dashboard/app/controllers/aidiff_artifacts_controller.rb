class AidiffArtifactsController <ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource except: [:create]

  def create
    puts 'create'
    section_ids = params[:sectionIds].filter do |id|
      current_user.sections_instructed.any? {|section| id.to_i == section.id}
    end
    puts section_ids.inspect

    message = AidiffMessage.find(params[:messageId])
    puts message.inspect
    puts 'calling authorize'
    authorize! :manage, message
    puts 'authorized'

    unless message.is_artifact_candidate
      return head :bad_request
    end

    puts params.inspect

    unit_id = params[:unitId]
    lesson_id = params[:lessonId].to_i
    puts unit_id
    puts lesson_id

    thing = {
      unit_id: unit_id,
      lesson_id: lesson_id,
      section_id: section_ids[0].to_i
    }

    puts thing.inspect
    puts current_user.id

    puts SharedConstants::AI_DIFF_ARTIFACT_TYPE[message.artifact_candidate_type]


    @aidiff_exit_ticket = AidiffArtifact.create(
      type: SharedConstants::AI_DIFF_ARTIFACT_TYPE[message.artifact_candidate_type.upcase.to_sym],
      aidiff_thread: message.aidiff_thread,
      content: message.content,
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

    puts 'created exit ticket'
    puts @aidiff_exit_ticket.inspect

    #AidiffExitTicket.create!(validate_params.merge(user_id: current_user.id))
    render json: @aidiff_exit_ticket.summarize
  rescue StandardError => exception
    puts exception.full_message
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
