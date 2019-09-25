class Api::V1::UserSchoolInfosController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource only: :update_last_confirmation_date

  # PATCH /api/v1/users_school_infos/<id>/update_last_confirmation_date
  def update_last_confirmation_date
    @user_school_info.update!(last_confirmation_date: DateTime.now)

    head :no_content
  end

  # PATCH /api/v1/users_school_infos
  def update
    unless school_info_params[:school_id].present? || school_info_params[:country].present?
      render json: {error: "school id or country is not present"}, status: 422
      return
    end

    school_info_params.delete(:full_address) if school_info_params[:full_address]&.blank?

    if school_info_params[:country]&.downcase&.eql? 'united states'
      school_info_params[:country] = 'US'
    end

    existing_school_info = Queries::SchoolInfo.last_complete(current_user)
    existing_school_info&.assign_attributes school_info_params
    if existing_school_info.nil? || existing_school_info.changed?
      submitted_school_info =
        if school_info_params[:school_id]
          SchoolInfo.where(school_info_params).
          first_or_create
        else
          # VALIDATION_COMPLETE is passed when the school_id does not exist to check
          # form for completeness; specifically, school name is required.
          # If school_id does not exist, ncesSchoolId is set to -1 when the checkbox
          # for school not found is clicked.
          SchoolInfo.where(school_info_params).
          first_or_create(validation_type: SchoolInfo::VALIDATION_COMPLETE)
        end
      unless current_user.update(school_info: submitted_school_info)
        render json: current_user.errors, status: 422
        return
      end
      current_user.user_school_infos.where(school_info: submitted_school_info).
        update(last_confirmation_date: DateTime.now)
    else
      current_user.user_school_infos.where(school_info: existing_school_info).
        update(last_confirmation_date: DateTime.now)
    end
  end

  private

  def school_info_params
    @school_info_params ||= params.require(:user).require(:school_info_attributes).
      permit(:school_type, :school_name, :full_address, :country, :school_id)
  end
end
