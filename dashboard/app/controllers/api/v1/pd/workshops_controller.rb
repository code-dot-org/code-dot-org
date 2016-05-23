class Api::V1::Pd::WorkshopsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Workshop'

  # GET /api/v1/pd/workshops
  def index
    if params[:state]
      @workshops = @workshops.in_state(params[:state])
    end

    render json: @workshops, each_serializer: Api::V1::Pd::WorkshopSerializer
  end

  def k5_public_map_index
    @workshops = @workshops.where(
      course: Pd::Workshop::COURSE_CSF,
      workshop_type: Pd::Workshop::TYPE_PUBLIC
    )

    render json: @workshops, each_serializer: Api::V1::Pd::WorkshopK5MapSerializer
  end

  # GET /api/v1/pd/workshops/1
  def show
    render json: @workshop, serializer: Api::V1::Pd::WorkshopSerializer
  end

  # PATCH /api/v1/pd/workshops/1
  def update
    adjust_facilitators
    if @workshop.update(workshop_params)
      render json: @workshop, serializer: Api::V1::Pd::WorkshopSerializer
    else
      render json: {errors: @workshop.errors.full_messages}, status: :bad_request
    end
  end

  # POST /api/v1/pd/workshops
  def create
    @workshop.organizer = current_user
    adjust_facilitators
    if @workshop.save
      render json: @workshop, serializer: Api::V1::Pd::WorkshopSerializer
    else
      render json: {errors: @workshop.errors.full_messages}, status: :bad_request
    end
  end

  # DELETE /api/v1/pd/workshops/1
  def destroy
    @workshop.destroy!
    head :no_content
  end

  # POST /api/v1/pd/workshops/1/start
  def start
    section = @workshop.start!
    render json: {section_id: section.id, section_code: section.code}
  end

  # POST /api/v1/pd/workshops/1/end
  def end
    @workshop.end!
    head :no_content
  end

  private

  def adjust_facilitators
    supplied_facilitator_ids = params[:pd_workshop].delete(:facilitators)
    return unless supplied_facilitator_ids

    existing_facilitator_ids = @workshop.facilitators.map(&:id)
    new_facilitator_ids = supplied_facilitator_ids - existing_facilitator_ids
    facilitator_ids_to_remove = existing_facilitator_ids - supplied_facilitator_ids

    facilitator_ids_to_remove.each do |facilitator_id|
      @workshop.facilitators.delete(facilitator_id)
    end

    new_facilitator_ids.each do |facilitator_id|
      facilitator = User.find_by(id: facilitator_id)

      # Since these ids are supplied by the caller, make sure they each actually represent a real user
      # and that the user is actually a facilitator before adding.
      next unless facilitator && facilitator.facilitator?
      @workshop.facilitators << facilitator
    end
  end

  def workshop_params
    params.require(:pd_workshop).permit(
      :location_name,
      :location_address,
      :capacity,
      :workshop_type,
      :course,
      :subject,
      :notes,
      sessions_attributes: [:id, :start, :end, :_destroy]
    )
  end
end
