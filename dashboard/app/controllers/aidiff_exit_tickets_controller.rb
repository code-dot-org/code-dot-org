class AidiffExitTicketsController <ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource

  # POST /aidiff_exit_ticket
  def create
    @aidiff_exit_ticket = AidiffExitTicket.create!(validate_params.merge(user_id: current_user.id))
    render json: @aidiff_exit_ticket.summarize
  rescue StandardError => exception
    return render status: :bad_request, json: {error: exception.message}
  end

  # PUT /aidiff_exit_ticket/:id
  def update
    @aidiff_exit_ticket.update!(validate_params)
    render json: @aidiff_exit_ticket.summarize
  end

  # GET /aidiff_exit_tickets
  def index
    if [:lesson_ids, :unit_ids, :unit_group_ids, :section_ids,].any? {|key| params[key].present?}
      unit_group_reln = @aidiff_exit_tickets.joins(:aidiff_artifact_associations).where(aidiff_artifact_associations: {unit_group_id: params[:unit_group_ids]})
      unit_reln = @aidiff_exit_tickets.joins(:aidiff_artifact_associations).where(aidiff_artifact_associations: {unit_id: params[:unit_ids]})
      lesson_reln = @aidiff_exit_tickets.joins(:aidiff_artifact_associations).where(aidiff_artifact_associations: {lesson_id: params[:lesson_ids]})
      section_reln = @aidiff_exit_tickets.joins(:aidiff_artifact_associations).where(aidiff_artifact_associations: {section_id: params[:section_ids]})
      render json: unit_group_reln.or(unit_reln).or(lesson_reln).or(section_reln).distinct&.map(&:summarize)
    else
      render json: @aidiff_exit_tickets&.map(&:summarize)
    end
  end

  # def show
  #   #TODO: render the projection page
  # end

  #TODO actually validate here
  private def validate_json(content)
    return content
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
