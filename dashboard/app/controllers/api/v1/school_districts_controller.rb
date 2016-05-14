class Api::V1::SchoolDistrictsController < ApplicationController
  # GET /api/v1/school_district
  # GET /api/v1/school_district.csv
  def index
    render json: ActiveModel::Serializer.new(SchoolDistrict.where(state: params[:state]), each_serializer: Api::V1::SchoolDistrictSerializer)
  end

end
