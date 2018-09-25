class Api::V1::RegionalPartnersController < ApplicationController
  before_action :authenticate_user!, except: :find

  # GET /api/v1/regional_partners
  def index
    regional_partners = (current_user.facilitator? || current_user.workshop_admin?) ? RegionalPartner.all : current_user.regional_partners

    render json: regional_partners.order(:name).map {|partner| {id: partner.id, name: partner.name}}
  end

  # GET /api/v1/regional_partners/capacity?role=:role&regional_partner_value=:regional_partner
  def capacity
    role = params[:role]
    regional_partner_value = current_user.workshop_admin? ? params[:regional_partner_value] : current_user.regional_partners.first.try(:id)

    render json: {capacity: get_partner_cohort_capacity(regional_partner_value, role)}
  end

  # GET /api/v1/regional_partners/find
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

    # Find the matching partner
    partner = RegionalPartner.find_by_region(zip_code, state)

    if partner
      render json: partner, serializer: Api::V1::Pd::RegionalPartnerSerializer
    else
      render_404
    end
  end

  private

  # Get the regional partner's cohort capacity for a specific role
  # @param role (ex: 'csd_teachers' or 'csf_facilitators')
  # @param regional_partner_value is 'none', 'all', or a regional partner's id
  # @return the partner's capacity for that role if an id is given, otherwise nil
  def get_partner_cohort_capacity(regional_partner_value, role)
    unless ['none', 'all'].include? regional_partner_value
      partner_id = regional_partner_value ? regional_partner_value : current_user.regional_partners.first
      regional_partner = RegionalPartner.find_by(id: partner_id)
      if role == 'csd_teachers'
        return regional_partner.cohort_capacity_csd
      elsif role == 'csp_teachers'
        return regional_partner.cohort_capacity_csp
      end
    end
    nil
  end
end
