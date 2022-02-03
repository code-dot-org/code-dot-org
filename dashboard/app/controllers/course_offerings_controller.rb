class CourseOfferingsController < ApplicationController
  load_and_authorize_resource

  before_action :require_levelbuilder_mode
  before_action :authenticate_user!

  def edit
    @course_offering = CourseOffering.find_by!(key: params[:key])
    render :not_found unless @course_offering
  end

  def update
    @course_offering = CourseOffering.find_by!(key: params[:key])
    @course_offering.update!(course_offering_params)

    if Rails.application.config.levelbuilder_mode
      @course_offering.write_serialization
    end

    render json: @course_offering.summarize_for_edit
  rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid => e
    render(status: :not_acceptable, plain: e.message)
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
