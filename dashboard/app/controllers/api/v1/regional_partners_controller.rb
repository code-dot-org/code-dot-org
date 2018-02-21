class Api::V1::RegionalPartnersController < ApplicationController
  # GET /api/v1/regional-partner/<school_district_id>/<course>
  def index
    school_district = SchoolDistrict.find(params[:school_district_id])

    if params[:course] == 'unselected'
      render json: school_district.regional_partners_school_districts.first, include: :regional_partner
    else
      regional_partner_mapping = school_district.regional_partners_school_districts.find_by(course: params[:course]) || school_district.regional_partners_school_districts.find_by(course: nil)

      render json: regional_partner_mapping, include: :regional_partner
    end
  end

  # GET /api/v1/regional-partner/for_user
  def for_user
    regional_partners = current_user.permission?(UserPermission::WORKSHOP_ADMIN) ? RegionalPartner.all : current_user.regional_partners

    render json: regional_partners.order(:name).map {|partner| {id: partner.id, name: partner.name}}
  end
end
