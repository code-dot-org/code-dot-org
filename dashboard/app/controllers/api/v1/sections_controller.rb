class Api::V1::SectionsController < ApplicationController
  load_and_authorize_resource
  layout false

  # Don't bother redirecting to login when denying access to the JSON APIs
  rescue_from CanCan::AccessDenied do
    head :forbidden
  end

  # GET /api/v1/sections
  # Get the set of sections owned by the current user
  def index
    render json: @sections.map(&:summarize)
  end

  # GET /api/v1/sections/<id>
  # Get complete details of a particular section
  def show
    render json: @section.summarize
  end
end
