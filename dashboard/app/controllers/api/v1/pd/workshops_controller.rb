class Api::V1::Pd::WorkshopsController < ::ApplicationController
  include Pd::WorkshopFilters
  include Api::CsvDownload

  load_and_authorize_resource class: 'Pd::Workshop', only: [:show, :update, :create, :destroy, :start, :end, :summary]
  before_action :load_collection, only: [:index, :filter]

  # GET /api/v1/pd/workshops
  def index
    if params[:state]
      @workshops = @workshops.in_state(params[:state])
    end

    if params[:facilitator_view]
      @workshops = @workshops.facilitated_by(current_user)
    end

    if params[:organizer_view]
      @workshops = @workshops.organized_by(current_user)
    end

    if (current_user.admin? || current_user.permission?(UserPermission::WORKSHOP_ADMIN)) && params[:workshop_id]
      @workshops = ::Pd::Workshop.where(id: params[:workshop_id])
    end

    render json: @workshops, each_serializer: Api::V1::Pd::WorkshopSerializer
  end

  def workshops_user_enrolled_in
    authorize! :workshops_user_enrolled_in, Pd::Workshop

    workshops = ::Pd::Enrollment.for_user(current_user).map do |enrollment|
      Api::V1::Pd::WorkshopSerializer.new(enrollment.workshop, scope: {enrollment_code: enrollment.try(:code)}).attributes
    end

    render json: workshops
  end

  # GET /api/v1/pd/workshops/filter
  def filter
    limit = params[:limit].try(:to_i)
    workshops = filter_workshops(@workshops)

    respond_to do |format|
      limited_workshops = workshops.limit(limit)
      format.json do
        render json: {
          limit: limit,
          total_count: workshops.length,
          filters: filter_params,
          workshops: limited_workshops.map {|w| Api::V1::Pd::WorkshopSerializer.new(w).attributes}
        }
      end
      format.csv do
        # don't apply limit to csv download
        send_as_csv_attachment workshops.map {|w| Api::V1::Pd::WorkshopDownloadSerializer.new(w).attributes}, 'workshops.csv'
      end
    end
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end

  # GET /api/v1/pd/workshops/upcoming_teachercon
  def upcoming_teachercon
    workshops = Pd::Workshop.scheduled_start_on_or_after(Date.today.beginning_of_day).where(
      subject: Pd::Workshop::SUBJECT_TEACHER_CON
    )
    workshops = workshops.where(course: params[:course]) if params[:course]
    render json: workshops, each_serializer: Api::V1::Pd::WorkshopSerializer
  rescue ArgumentError => e
    render json: {error: e.message}, status: :bad_request
  end

  # Upcoming (not started) public CSF workshops.
  def k5_public_map_index
    @workshops = Pd::Workshop.scheduled_start_on_or_after(Date.today.beginning_of_day).where(
      course: Pd::Workshop::COURSE_CSF,
      on_map: true
    ).where.not(processed_location: nil)

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
      notify if should_notify?
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
    @workshop.start!
    head :no_content
  end

  # POST /api/v1/pd/workshops/1/end
  def end
    @workshop.end!
    Pd::AsyncWorkshopHandler.process_ended_workshop @workshop.id
    head :no_content
  end

  # GET /api/v1/pd/workshops/1/summary
  def summary
    render json: @workshop, serializer: Api::V1::Pd::WorkshopSummarySerializer
  end

  private

  def load_collection
    # We need to do this to get around an annoying CanCanCan issue - when we load a
    # collection of workshops, only the current user is loaded as a facilitator (if they
    # are a facilitator). The load_collection action within CanCanCan does not seem to
    # correctly join workshops and workshop_facilitators. Therefore, we need to write our
    # own action to do loading
    authenticate_user!

    unless current_user.admin? || current_user.workshop_admin? ||
      current_user.workshop_organizer? || current_user.facilitator?
      raise CanCan::AccessDenied.new
    end

    @workshops =
      if current_user.admin? || current_user.workshop_admin?
        Pd::Workshop.all
      else
        Pd::Workshop.facilitated_or_organized_by(current_user)
      end
  end

  def should_notify?
    ActiveRecord::Type::Boolean.new.deserialize(params[:notify])
  end

  def notify
    @workshop.enrollments.each do |enrollment|
      Pd::WorkshopMailer.detail_change_notification(enrollment).deliver_now
    end
    @workshop.facilitators.each do |facilitator|
      Pd::WorkshopMailer.facilitator_detail_change_notification(facilitator, @workshop).deliver_now
    end
    Pd::WorkshopMailer.organizer_detail_change_notification(@workshop).deliver_now
  end

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
      :on_map,
      :funded,
      :course,
      :subject,
      :notes,
      sessions_attributes: [:id, :start, :end, :_destroy]
    )
  end
end
