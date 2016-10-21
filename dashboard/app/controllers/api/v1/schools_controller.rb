class Api::V1::SchoolsController < ApplicationController
  # GET /api/v1/school/<school_district_id>/<school_type>
  def index
    schools = School.where(school_district_id: params[:school_district_id], school_type: params[:school_type]).pluck(:id, :name)
    render json: ActiveModel::Serializer.new(schools, each_serializer: Api::V1::SchoolSerializer)
  end
end
