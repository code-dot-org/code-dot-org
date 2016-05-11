class Api::V1::Pd::WorkshopsController < ::ApplicationController
  load_and_authorize_resource class: 'Pd::Workshop'

  # GET /api/v1/pd/workshops
  def index
    if params[:state]
      @workshops = @workshops.in_state(params[:state])
    end

    render json: @workshops, each_serializer: Api::V1::Pd::WorkshopSerializer
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
    facilitator_param_list = params[:pd_workshop].delete(:facilitators)
    return unless facilitator_param_list

    existing_facilitators = Set.new(@workshop.facilitators)
    facilitator_param_list.each do |facilitator_params|
      next if facilitator_params[:email].blank?
      facilitator = User.find_or_create_facilitator(facilitator_params.permit(:email, :name), current_user)
      if existing_facilitators.include? facilitator
        existing_facilitators.delete facilitator
      else
        @workshop.facilitators << facilitator
      end
    end
    existing_facilitators.each do |removed_facilitator|
      @workshop.facilitators.delete(removed_facilitator)
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
