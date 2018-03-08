class Api::V1::RegionalPartnersController < ApplicationController
  # GET /api/v1/regional_partners
  def index
    regional_partners = (current_user.facilitator? || current_user.workshop_admin?) ? RegionalPartner.all : current_user.regional_partners

    render json: regional_partners.order(:name).map {|partner| {id: partner.id, name: partner.name}}
  end

  # GET /api/v1/regional_partners/capacity?role=:role&regional_partner_filter=:regional_partner
  def capacity
    role = params[:role]
    regional_partner_filter = params[:regional_partner_filter]

    render json: {capacity: get_partner_cohort_capacity(regional_partner_filter, role)}
  end

  def get_partner_cohort_capacity(regional_partner_filter, role)
    unless ['none', 'all'].include? regional_partner_filter
      partner_id = regional_partner_filter ? regional_partner_filter : current_user.regional_partners.first
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
