class Api::V1::SectionsController < ApplicationController
  layout false

  # Get the set of sections owned by the current user
  def index
    if !current_user
      head :forbidden
    elsif current_user.teacher?
      render json: current_user.sections.map(&:summarize)
    else
      render json: []
    end
  end

  def show
    if !current_user || !current_user.teacher?
      head :forbidden
    else
      section = Section.find_by!(id: params[:id])
      authorize! :manage, section
      render json: section.summarize
    end
  end
end
