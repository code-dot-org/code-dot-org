class Api::V1::UserSchoolInfosController < ApplicationController
  include SchoolInfoDeduplicator
  before_action :authenticate_user!
  before_action :load_user_school_info
  load_and_authorize_resource except: update_last_confirmation_date

  #```PATCH /api/v1/user/<id>/school_info
  # A new row is added to the user school infos table when a teacher updates current school to a different school,
  # then the school_info_id is updated in the users table.
  def update_school_info_id
    if school_info_params.blank?
      return
    end

    new_school_info = nil
    if latest_school_info&.complete?
      if latest_school_info.eql? school_info_params
        new_school_info = latest_school_info
      else
        # De-dup school info
        new_school_info = get_duplicate_school_info(school_info_params)

        new_school_info ||= SchoolInfo.create(school_info_params)
      end
    else
      # We had partial school info entered, so update it
      new_school_info = latest_school_info
      new_school_info.update!(school_info_params)
    end

    UserSchoolInfo.find_or_create_by(user: @user, school_info: new_school_info).
      update!(last_confirmation_date: DateTime.now)

    if new_school_info.complete?
      @user.school_info.update(end_date: DateTime.now)
      @user.update(school_info: new_school_info)
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
