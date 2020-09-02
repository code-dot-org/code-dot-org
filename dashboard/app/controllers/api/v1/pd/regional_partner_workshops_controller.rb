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
    if partner.nil?
      # TODO: should we instead render json which has the keys but nil values, to preserve previous behavior?
      render json: {}
    else
      render json: partner,
             serializer: Api::V1::Pd::RegionalPartnerWorkshopsSerializer,
             scope: {course: @course, subject: @subject}
    end
  end

  # GET /api/v1/pd/regional_partner_workshops
  def index
    render json: @partners,
           each_serializer: Api::V1::Pd::RegionalPartnerWorkshopsSerializer,
           scope: {course: @course, subject: @subject}
  end

  private

  def get_filtered_workshops
    @partners = RegionalPartner.includes(:pd_workshops)

    @course = params[:course]
    @partners = @partners.where(pd_workshops: {course: @course}) if @course.present?

    @subject = params[:subject]
    @partners = @partners.where(pd_workshops: {subject: @subject}) if @subject.present?
  end
end
