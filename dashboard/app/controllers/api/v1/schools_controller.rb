require 'cdo/school_autocomplete'

class Api::V1::SchoolsController < ApplicationController
  # GET /api/v1/school/<school_district_id>/<school_type>
  def index
    schools = School.where(school_district_id: params[:school_district_id], school_type: params[:school_type])
    serialized_schools = schools.map do |school|
      Api::V1::SchoolSerializer.new(school).attributes
    end
    render json: serialized_schools
  end

  # GET /dashboardapi/v1/schoolsearch/:q/:limit
  def search
    query = params.require(:q)
    limit = [40, Integer(params[:limit])].min
    render json: SchoolAutocomplete.get_matches(query, limit)
  end

end
