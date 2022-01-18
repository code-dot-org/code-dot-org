class CourseOfferingsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode
  before_action :authenticate_user!

  def edit
    @course_offering = CourseOffering.find_by!(key: params[:key])
    render :not_found unless @course_offering
  end

  def i18n_params
    params.permit(
      :display_name
    ).to_h
  end

  private

  def course_offering_params
    params.permit(:key, :display_name, :is_featured, :category).to_h
  end
end
