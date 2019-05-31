class Api::V1::UserSchoolInfosController < ApplicationController
  before_action :authenticate_user!
  load_and_authorize_resource only: :update_last_confirmation_date
  skip_before_action :verify_authenticity_token

  # PATCH /api/v1/users_school_infos/<id>/update_last_confirmation_date
  def update_last_confirmation_date
    @user_school_info.update!(last_confirmation_date: DateTime.now)

    head :no_content
  end

  # PATCH /api/v1/users_school_infos/<id>/school_info
  def update
    if school_info_params[:school_id].present?
      existing_school_info = current_user.school_info
      if existing_school_info && !existing_school_info.complete?
        existing_school_info.update!(school_info_params)
        current_user.user_school_infos.where(school_info: existing_school_info).update(last_confirmation_date: DateTime.now)
      else
        new_school = SchoolInfo.find_or_create_by(school_info_params)
        if current_user.school_info == new_school
          current_user.user_school_infos.where(school_info: new_school).update(last_confirmation_date: DateTime.now)
        else
          current_user.update!(school_info_id: new_school.id)
        end
      end
    else
      # partial school info entered, so update it
      existing_school_info = current_user.school_info
      if existing_school_info && !existing_school_info.complete?
        existing_school_info.update!(school_info_params)
        current_user.user_school_infos.where(school_info: existing_school_info).update(last_confirmation_date: DateTime.now)
      elsif school_info_params[:country].present?
        if existing_school_info
          existing_school_info.assign_attributes(school_info_params)
          if existing_school_info.changed?
            new_school_info = SchoolInfo.create!(school_info_params.merge(validation_type: SchoolInfo::VALIDATION_NONE))
            current_user.update!(school_info_id: new_school_info.id)
          else
            current_user.user_school_infos.where(school_info: existing_school_info).update(last_confirmation_date: DateTime.now)
          end
        else
          new_school_info = SchoolInfo.create!(school_info_params.merge(validation_type: SchoolInfo::VALIDATION_NONE))
          current_user.update!(school_info_id: new_school_info.id)
        end
      end
    end
  end

  private

  def school_info_params
    params.require(:user).require(:school_info_attributes).permit(:school_type, :school_name, :full_address, :country, :school_id)
  end
end
