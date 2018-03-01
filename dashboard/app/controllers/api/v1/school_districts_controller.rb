class Api::V1::SchoolDistrictsController < ApplicationController
  # rubocop:disable Style/NumericLiterals
  EXCLUDED_DISTRICT_IDS = [
    3620580, # NEW YORK CITY PUBLIC SCHOOLS
  ].freeze
  # rubocop:enable Style/NumericLiterals

  # GET /api/v1/school_district
  # GET /api/v1/school_district.csv
  def index
    districts = SchoolDistrict.where(state: params[:state]).where.not(id: EXCLUDED_DISTRICT_IDS)
    serialized_districts = districts.map do |district|
      Api::V1::SchoolDistrictSerializer.new(district).attributes
    end
    render json: serialized_districts
  end

  # GET /dashboardapi/v1/districtsearch/:q/:limit
  def search
    render json: Api::V1::SchoolDistrictAutocomplete.get_matches(
      params.require(:q),
      params[:limit]
    )
  end
end
