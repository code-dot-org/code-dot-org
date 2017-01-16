class Api::V1::RegionalPartnersController < ApplicationController
  # GET /api/v1/regional-partner/<school_district_id>/<course>
  BROWARD_OVERRIDDEN_DISTRICTS_FOR_CSD = ['1200390', '1201320']

  def index
    school_district = SchoolDistrict.find(params[:school_district_id])

    regional_partner = school_district.regional_partner

    if BROWARD_OVERRIDDEN_DISTRICTS_FOR_CSD.include?(params[:school_district_id]) && params[:course] == 'csd'
      regional_partner = RegionalPartner.find_by(name: 'Broward County Public Schools')
    end

    render json: regional_partner
  end
end
