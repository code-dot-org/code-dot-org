class Api::V1::SectionsController < ApplicationController
  layout false

  # Don't bother redirecting to login when denying access to the JSON APIs
  rescue_from CanCan::AccessDenied do
    head :forbidden
  end

  # GET /api/v1/sections
  # Get the set of sections owned by the current user
  def index
    return head :forbidden unless current_user
    render json: current_user.sections.map(&:summarize)
  end

  # GET /api/v1/sections/<id>
  # Get complete details of a particular section
  def show
    section = Section.find(params[:id])
    authorize! :read, section
    render json: section.summarize
  end
end
