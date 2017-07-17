class Dashboardapi::SectionsController < ApplicationController
  layout false

  # Get the set of sections owned by the current user
  def index
    return head :forbidden unless current_user
    render json: current_user.sections.map(&:summarize)
  end
end
