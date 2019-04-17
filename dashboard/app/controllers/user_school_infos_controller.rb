class UserSchoolInfosController < ApplicationController
  #before_action :authenticate_user!

  # PATCH /api/v1/users_school_infos/<id>/update_last_confirmation_date
  def update_last_confirmation_date
    user_school_info = UserSchoolInfo.find(params[:id])
    result = user_school_info.update(last_confirmation_date: DateTime.now)
    if result
      head :no_content
    else
      render json: user_school_info.errors, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/users_school_infos/<id>/update_end_date
  def update_end_date
    user_school_info = UserSchoolInfo.find(params[:id])
    if user_school_info.update!(end_date: DateTime.now)
      user_school_info.user.update!(properties: {last_seen_school_info_interstitial: DateTime.now})
    end

    head :no_content
  end

  # solution 2
  # def update_end_date
  #   user_school_info = UserSchoolInfo.find(params[:id])

  #   user_school_info.update!(end_date: DateTime.now)
  # end

  # PATCH /api/v1/users_school_infos/<id>/update_school_info_id
  def update_school_info_id
    ActiveRecord::Base.transaction do
      user_school_info = UserSchoolInfo.find(params[:id])
      school = user_school_info.school_info.school
      unless school
        school = School.create(new_school_params)
        school.school_info.create(school_info_params)
      end

      school_info = school.school_info.order(created_at: :desc).first

      user = user_school_info.user

      user.user_school_infos.create({school_info_id: school_info.id, last_confirmation_date: DateTime.now, start_date: user.created_at})

      user.update({school_info_id: school_info.id})

      head :no_content
    end
  end

  private

  def new_school_params
    params.require(:school).permit(:name, :city, :state)
  end

  def school_info_params
    params.require(:school_info).permit(:school_type, :state, :school_name, :country)
  end
end
