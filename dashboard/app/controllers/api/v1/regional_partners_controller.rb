class Api::V1::RegionalPartnersController < ApplicationController
  # GET /api/v1/regional_partners/<school_district_id>/<course>
  def for_school_district_and_course
    school_district = SchoolDistrict.find(params[:school_district_id])

    if params[:course] == 'unselected'
      render json: school_district.regional_partners_school_districts.first, include: :regional_partner
    else
      regional_partner_mapping = school_district.regional_partners_school_districts.find_by(course: params[:course]) || school_district.regional_partners_school_districts.find_by(course: nil)

      render json: regional_partner_mapping, include: :regional_partner
    end
  end

  # GET /api/v1/regional_partners
  def index
    regional_partners = (current_user.facilitator? || current_user.workshop_admin?) ? RegionalPartner.all : current_user.regional_partners

    render json: regional_partners.order(:name).map {|partner| {id: partner.id, name: partner.name}}
  end
end
