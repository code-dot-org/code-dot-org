class Api::V1::Pd::WorkshopsController < ApplicationController
  include Pd::WorkshopFilters
  include Api::CsvDownload
  include Pd::Application::RegionalPartnerTeacherconMapping

  COLLECTION_ACTIONS = [:index, :filter].freeze

  load_and_authorize_resource class: 'Pd::Workshop', only:
    [:show, :update, :create, :destroy, :start, :end, :summary, :unstart, :reopen, :potential_organizers] + COLLECTION_ACTIONS

  before_action :load_workshops, only: COLLECTION_ACTIONS

  # GET /api/v1/pd/workshops
  def index
    if params[:state]
      @workshops = @workshops.in_state(params[:state])
    end

    if params[:facilitator_view]
      @workshops = @workshops.facilitated_by(current_user)
    end

    if params[:organizer_view]
      @workshops = @workshops.organized_by(current_user).or(@workshops.where(regional_partner: current_user.regional_partners)).order(:id)
    end

    if (current_user.admin? || current_user.permission?(UserPermission::WORKSHOP_ADMIN)) && params[:workshop_id]
      @workshops = ::Pd::Workshop.where(id: params[:workshop_id])
    end

    @workshops = @workshops.exclude_summer if params[:exclude_summer]

    render json: @workshops, each_serializer: Api::V1::Pd::WorkshopSerializer
  end

  def workshops_user_enrolled_in
    authorize! :workshops_user_enrolled_in, Pd::Workshop

    enrollments = ::Pd::Enrollment.for_user(current_user).all.reject do |enrollment|
      enrollment.workshop&.future_or_current_teachercon_or_fit?
    end

    workshops = enrollments.map do |enrollment|
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
          workshops: limited_workshops.map {|w| Api::V1::Pd::WorkshopSerializer.new(w, scope: {current_user: current_user}).attributes}
        }
      end
      format.csv do
        # don't apply limit to csv download
        send_as_csv_attachment workshops.map {|w| Api::V1::Pd::WorkshopDownloadSerializer.new(w).attributes}, 'workshops.csv'
      end
    end
  rescue ArgumentError => exception
    render json: {error: exception.message}, status: :bad_request
  end

  # GET /api/v1/pd/workshops/upcoming_teachercons
  # returns all upcoming teachercons for admins, associated teachercons for
  # regional partners, and an empty set for everyone else.
  def upcoming_teachercons
    workshops = Pd::Workshop.
      scheduled_start_on_or_after(Time.zone.today.beginning_of_day).
      where(subject: Pd::Workshop::SUBJECT_TEACHER_CON)

    if params[:course]
      workshops = workshops.where(course: params[:course])
    end

    if current_user.admin? || current_user.workshop_admin?
      # admins get to see everything
    elsif current_user.regional_partners.any?
      # regional partners get to see workshops associated with their matching
      # teachercon
      cities = current_user.
        regional_partners.
        filter_map {|partner| get_matching_teachercon(partner)}.
        to_set.
        pluck(:city).
        map {|city| "%#{city}%"}

      query = Array.new(cities.length, "location_address like ?").join(" OR ")
      workshops = workshops.where(query, *cities)
    else
      # everyone else gets to see nothing
      workshops = Pd::Workshop.none
    end

    render json: workshops, each_serializer: Api::V1::Pd::WorkshopSerializer
  rescue ArgumentError => exception
    render json: {error: exception.message}, status: :bad_request
  end

  # GET /api/v1/pd/workshops/1
  def show
    render json: @workshop, serializer: Api::V1::Pd::WorkshopSerializer
  end

  # PATCH /api/v1/pd/workshops/1
  def update
    adjust_facilitators
    adjust_course_offerings
    adjust_grades

    # The below user types have permission to set the regional partner. CSF Facilitators
    # can initially set the regional partner, but cannot edit it once it is set.
    can_update_regional_partner = current_user.permission?(UserPermission::WORKSHOP_ORGANIZER) ||
      current_user.permission?(UserPermission::PROGRAM_MANAGER) ||
      current_user.permission?(UserPermission::WORKSHOP_ADMIN)

    new_workshop_params = workshop_params(can_update_regional_partner)

    if @workshop.update(new_workshop_params)
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
    adjust_course_offerings
    adjust_grades

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

  # POST /api/v1/pd/workshops/1/unstart (admin only)
  def unstart
    # using update_attribute to skip validation
    @workshop.update_attribute(:started_at, nil)
    head :no_content
  end

  # POST /api/v1/pd/workshops/1/end
  def end
    @workshop.end!
    head :no_content
  end

  # POST /api/v1/pd/workshops/1/reopen (admin only)
  def reopen
    # using update_attribute to skip validation
    @workshop.update_attribute(:ended_at, nil)
    head :no_content
  end

  # GET /api/v1/pd/workshops/1/summary
  def summary
    render json: @workshop, serializer: Api::V1::Pd::WorkshopSummarySerializer
  end

  use_reader_connection_for_route(:potential_organizers)

  # Users who could be re-assigned to be the organizer of this workshop
  def potential_organizers
    render json: @workshop.potential_organizers.pluck(:name, :id).map {|name, id| {label: name, value: id}}
  end

  private def load_workshops
    # Load the workshop collection through scopes that include all associated users, not just the current user.
    #
    # Since CanCanCan filters collections with INNER JOIN on associations, loading a workshop
    # collection for a facilitator has the side effect of only retrieving the current user as a facilitator
    # and ignoring other facilitators.
    #
    # We could potentially specify the ability as a scope and block, but these types of abilities
    # can't be combined and therefore won't work with our current complex logic in ability.rb
    #
    # See https://github.com/CanCanCommunity/cancancan/wiki/Defining-Abilities#hash-of-conditions

    @workshops =
      if current_user.admin? || current_user.workshop_admin?
        Pd::Workshop.all
      else
        Pd::Workshop.managed_by(current_user)
      end
  end

  private def should_notify?
    ActiveRecord::Type::Boolean.new.deserialize(params[:notify])
  end

  private def notify
    @workshop.enrollments.each do |enrollment|
      Pd::WorkshopMailer.detail_change_notification(enrollment).deliver_now

      # Also send to the user's alternate summer email if they entered it in their application and it's
      # for a summer workshop.
      if enrollment.workshop&.subject == Pd::Workshop::SUBJECT_SUMMER_WORKSHOP
        alt_summer_email = enrollment.user&.alternate_email
        if alt_summer_email.present?
          Pd::WorkshopMailer.detail_change_notification(enrollment, to_email: alt_summer_email).deliver_now
        end
      end
    end
    @workshop.facilitators.each do |facilitator|
      Pd::WorkshopMailer.facilitator_detail_change_notification(facilitator, @workshop).deliver_now
    end
    Pd::WorkshopMailer.organizer_detail_change_notification(@workshop).deliver_now
  end

  private def adjust_facilitators
    ws_params = params[:pd_workshop]
    return unless ws_params.key?(:facilitators) || ws_params.key?("facilitators")
    supplied_facilitator_ids = ws_params.delete(:facilitators) || ws_params.delete("facilitators")
    supplied_facilitator_ids = [] if supplied_facilitator_ids.blank?

    valid_facilitators = User.joins(:permissions).where(id: supplied_facilitator_ids, user_permissions: {permission: 'facilitator'}).distinct

    @workshop.facilitators = valid_facilitators
  end

  private def adjust_course_offerings
    ws_params = params[:pd_workshop]

    return unless ws_params.key?(:course_offerings) ||  ws_params.key?("course_offerings")
    supplied_course_offering_ids = ws_params.delete(:course_offerings) || ws_params.delete("course_offerings")
    supplied_course_offering_ids = [] if supplied_course_offering_ids.blank?
    @workshop.course_offerings = CourseOffering.where(id: supplied_course_offering_ids)
  end

  private def adjust_grades
    ws_params = params[:pd_workshop]
    return unless ws_params.key?(:grades) || ws_params.key?("grades")
    new_grades = ws_params.delete(:grades) || ws_params.delete("grades")
    new_grades = [] if new_grades.blank?
    @workshop.grades = new_grades
  end

  private def workshop_params(can_update_regional_partner = true)
    allowed_params = [
      :name,
      :location_name,
      :location_address,
      :capacity,
      :on_map,
      :funded,
      :funding_type,
      :course,
      :subject,
      :notes,
      :fee,
      :regional_partner_id,
      :organizer_id,
      :suppress_email,
      :third_party_provider,
      {sessions_attributes: [:id, :start, :end, :session_format, :meeting_link, :location_name, :location_address, :_destroy]},
      :module,
      :participant_group_type,
      :description,
      :registration_link,
      :prereq,
      :hidden,
      :grades,
      :time_zone,
    ]

    allowed_params.delete :regional_partner_id unless can_update_regional_partner
    allowed_params.delete :organizer_id unless current_user.permission?(UserPermission::WORKSHOP_ADMIN)

    params.require(:pd_workshop).permit(*allowed_params)
  end
end
