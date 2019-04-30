class Api::V1::UserSchoolInfosController < ApplicationController
  protect_from_forgery with: :null_session
  before_action :authenticate_user!
  before_action :load_user_school_info

  skip_before_action :verify_authenticity_token

  # PATCH /api/v1/users_school_infos/<id>/update_last_confirmation_date
  def update_last_confirmation_date
    puts "Inside controller - current user - #{@user_school_info.user.inspect}"
    if @user_school_info.user.id == current_user.id
      if @user_school_info.update(last_confirmation_date: DateTime.now)
        head :no_content
      else
        render json: @user_school_info.errors, status: :unprocessable_entity
      end
    else
      render json: {error: "Sorry, you cant update last_confirmation_date for another User"}, status: 401
    end
  end

  # PATCH /api/v1/users_school_infos/<id>/update_end_date
  def update_end_date
    if @user_school_info.update!(end_date: DateTime.now)
      if @user_school_info.user.update!(properties: {last_seen_school_info_interstitial: DateTime.now})
        head :no_content
      else
        render json: @user_school_info.errors, status: :unprocessable_entity
      end
    end
  end

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

      if user.update({school_info_id: school_info.id})
        head :no_content
      else
        render json: user.errors, status: :unprocessable_entity
      end
    end
  end

  private

  def load_user_school_info
    puts "load_user_school_info - params - #{params}"
    @user_school_info = UserSchoolInfo.find(params[:id])
    puts "load_user_school_info - info - #{@user_school_info.inspect}"
  end

  def new_school_params
    params.require(:school).permit(:name, :city, :state)
  end

  def school_info_params
    params.require(:school_info).permit(:school_type, :state, :school_name, :country)
  end
end
