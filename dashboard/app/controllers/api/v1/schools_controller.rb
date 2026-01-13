require 'cdo/firehose'

class Api::V1::SchoolsController < ApplicationController
  before_action :allow_cdo_cors, only: %i[afe_high_needs zip_search]
  load_resource :school, only: [:show, :afe_high_needs]

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

  # GET /api/v1/schools/:id/afe_high_needs
  def afe_high_needs
    render json: @school, serializer: Api::V1::SchoolSerializer
  end

  # GET /dashboardapi/v1/schoolsearch/:q/:limit
  def search
    search_results = Api::V1::SchoolAutocomplete.get_matches(
      params.require(:q),
      params[:limit],
      params[:use_new_search]
    )
    render json: search_results
  end

  # GET /dashboardapi/v1/schoolzipsearch/:zip
  def zip_search
    search_results = Api::V1::SchoolAutocomplete.get_zip_matches(params.require(:zip))
    render json: search_results
  end
end
