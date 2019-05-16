class Api::V1::UserSchoolInfosController < ApplicationController
  before_action :authenticate_user!
  before_action :load_user_school_info
  load_and_authorize_resource

  # PATCH /api/v1/users_school_infos/<id>/update_last_confirmation_date
  def update_last_confirmation_date
    @user_school_info.update!(last_confirmation_date: DateTime.now)

    head :no_content
  end

  # PATCH /api/v1/users_school_infos/<id>/update_end_date
  def update_end_date
    ActiveRecord::Base.transaction do
      @user_school_info.update!(end_date: DateTime.now, last_confirmation_date: DateTime.now)
      @user_school_info.user.update!(properties: {last_seen_school_info_interstitial: DateTime.now})
    end

    head :no_content
  end

  # PATCH /api/v1/user_school_infos/<id>/update_school_info_id
  # A new row is added to the user school infos table when a teacher updates current school to a different school,
  # then the school_info_id is updated in the users table.

  def update_school_info_id
    ActiveRecord::Base.transaction do
      school = @user_school_info.school_info.school
      unless school
        school = School.create!(new_school_params)
        school.school_info.create!(school_info_params)
      end

      school_info = school.school_info.order(created_at: :desc).first

      user = @user_school_info.user

      user.user_school_infos.create!({school_info_id: school_info.id, last_confirmation_date: DateTime.now, start_date: user.created_at})

      user.update!({school_info_id: school_info.id})
    end
  end

  private

  def load_user_school_info
    @user_school_info = UserSchoolInfo.find(params[:id])
  end

  def new_school_params
    params.require(:school).permit(:name, :city, :state)
  end

  def school_info_params
    params.require(:school_info).permit(:school_type, :state, :school_name, :country)
  end
end
