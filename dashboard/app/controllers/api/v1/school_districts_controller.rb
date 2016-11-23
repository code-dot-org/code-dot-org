class Api::V1::SchoolDistrictsController < ApplicationController
  # rubocop:disable Style/NumericLiterals
  EXCLUDED_DISTRICT_IDS = [
    3620580, # NEW YORK CITY PUBLIC SCHOOLS
  ]

  # GET /api/v1/school_district
  # GET /api/v1/school_district.csv
  def index
    districts = SchoolDistrict.where(state: params[:state]).where.not(id: EXCLUDED_DISTRICT_IDS)
    render json: districts, each_serializer: Api::V1::SchoolDistrictSerializer
  end
end
