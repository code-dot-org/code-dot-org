class Api::V1::SchoolsController < ApplicationController
  load_resource :school, only: :show

  # GET /api/v1/schools/<school_district_id>/<school_type>
  def index
    schools = School.where(school_district_id: params[:school_district_id], school_type: params[:school_type])
    serialized_schools = schools.map do |school|
      Api::V1::SchoolSerializer.new(school).attributes
    end
    render json: serialized_schools
  end

  # GET /api/v1/schools/:id
  def show
    render json: @school, serializer: Api::V1::SchoolAutocomplete::Serializer
  end

  # GET /dashboardapi/v1/schoolsearch/:q/:limit
  def search
    render json: Api::V1::SchoolAutocomplete.get_matches(
      params.require(:q),
      params[:limit],
      params[:use_new_search]
    )
  end
end
