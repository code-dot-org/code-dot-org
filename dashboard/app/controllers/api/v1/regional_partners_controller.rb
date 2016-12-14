class Api::V1::RegionalPartnersController < ApplicationController
  # GET /api/v1/regional-partner/<school_district_id>
  def index
    school_district = SchoolDistrict.find(params[:school_district_id])
    render json: {group: 1}#school_district.regional_partner
  end
end
