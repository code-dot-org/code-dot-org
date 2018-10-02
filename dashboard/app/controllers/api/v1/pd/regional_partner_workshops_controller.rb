class Api::V1::Pd::RegionalPartnerWorkshopsController < ::ApplicationController
  authorize_resource class: :regional_partner_workshops
  before_action :get_filtered_workshops

  # GET /api/v1/pd/regional_partner_workshops/find
  def find
    if params[:school]
      school = School.find(params[:school])
      state = school.state
      zip_code = school.zip
    else
      zip_code = params[:zip_code]
      state = params[:state]

      # lookup state abbreviation, since the supplied state can be the full name
      state = get_us_state_abbr_from_name(state, true) if state && state.length > 2
    end

    # Find the matching partner, even if it has no workshops
    partner = @partners.find_by_region(zip_code, state) || RegionalPartner.find_by_region(zip_code, state)
    render json: serialize_partner_workshops(partner)
  end

  # GET /api/v1/pd/regional_partner_workshops
  def index
    render json: @partners.map {|p| serialize_partner_workshops(p)}
  end

  private

  def serialize_partner_workshops(partner)
    # The scope is not being passed to the serializer with `render json: serializer:` syntax,
    # so initialize this explicitly.
    # TODO (Andrew): Look into updating our very outdated version of ActiveModelSerializers
    Api::V1::Pd::RegionalPartnerWorkshopsSerializer.new(
      partner,
      scope: {course: @course, subject: @subject}
    ).attributes
  end

  def get_filtered_workshops
    @partners = RegionalPartner.includes(:pd_workshops)

    @course = params[:course]
    @partners = @partners.where(pd_workshops: {course: @course}) if @course.present?

    @subject = params[:subject]
    @partners = @partners.where(pd_workshops: {subject: @subject}) if @subject.present?
  end
end
