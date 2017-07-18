class Api::V1::SectionsController < ApplicationController
  layout false

  # Get the set of sections owned by the current user
  def index
    return head :forbidden unless current_user
    render json: current_user.sections.map(&:summarize)
  end

  def show
    if !current_user || !current_user.teacher?
      head :forbidden
    else
      section = Section.find(params[:id])
      authorize! :manage, section
      render json: section.summarize
    end
  end
end
