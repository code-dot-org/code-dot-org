class Api::V1::SchoolDistrictsController < ApplicationController
  # GET /api/v1/school_district
  # GET /api/v1/school_district.csv
  def index
    render json: ActiveModel::Serializer.new(SchoolDistrict.where(state: params[:state]), each_serializer: Api::V1::SchoolDistrictSerializer)

    #respond_to do |format|
      #render json: ActiveModel::Serializer.new(SchoolDistrict.where(state: "CA"), each_serializer: Api::V1::SchoolDistrictSerializer).to_json
      # .where("name LIKE :prefix", prefix: "S%")
      #format.json {render json: SchoolDistrict.where(state: "CA"), each_serializer: Api::V1::SchoolDistrictSerializer}
    #end
  end

  def default_serializer_options
  {
    root: false
  }
  end

end
