class Api::V1::UserSchoolInfosController < ApplicationController
  include SchoolInfoDeduplicator
  before_action :authenticate_user!
  before_action :load_user_school_info
  # load_and_authorize_resource
  load_and_authorize_resource except: :update_school_info_id
  skip_before_action :verify_authenticity_token

  # PATCH /api/v1/users_school_infos/<id>/update_last_confirmation_date
  def update_last_confirmation_date
    @user_school_info.update!(last_confirmation_date: DateTime.now)

    head :no_content
  end

  # PATCH /api/v1/users_school_infos/<id>/school_info
  def update_school_info_id
    # Check if school info is duplicated, if not, create a new school with the params provided
    new_school_info = get_duplicate_school_info(school_info_params)
    new_school_info ||= SchoolInfo.new(school_info_params)

    # If it is an existing school, it will always return valid.  If it is a new school we check validation because
    # a blank form might be submitted, hence it new school will not be valid.  If validation fails, no updates
    # are made to the db and nothing is returned.
    if new_school_info.valid?

      # Verify that school info is saved in the db
      unless new_school_info.persisted?
        new_school_info.save
      end

      # A row is added to the user school infos table when a user partially completes the interstitial.
      # The user's entry will be save and pre-populated when the user views the form again.
      user_school_info = UserSchoolInfo.find_or_create_by(user: current_user, school_info: new_school_info)

      # When a user completely fills out the interstitial, a new row is added to the user school infos
      # table that includes the new school info id, then the school info id is updated in the users table.
      # table
      if new_school_info.complete?
        user_school_info.update!(last_confirmation_date: DateTime.now, end_date: DateTime.now)
        current_user.update(school_info: new_school_info)
      end
    end

    head :no_content
  end

    # # submit blank form
    # if school_info_params[school_type].blank? && school_info_params[school_name].blank? && school_info_params[country].blank?
    #   return head :no_content
    # end

    # new_school_info = nil
    # latest_school_info = current_user.user_school_infos.order(created_at: :desc).first.school_info

    # if latest_school_info&.complete?
    #   if latest_school_info.eql? school_info_params
    #     new_school_info = latest_school_info
    #   else
    #     # De-dup school info
    #     new_school_info = get_duplicate_school_info(school_info_params)

    #     new_school_info ||= SchoolInfo.create(school_info_params)
    #   end
    # else
    #   # We had partial school info entered, so update it
    #   new_school_info = latest_school_info
    #   new_school_info.update!(school_info_params)
    # end

    # UserSchoolInfo.find_or_create_by(user: @user, school_info: new_school_info).
    #   update!(last_confirmation_date: DateTime.now)

    # if new_school_info.complete?
    #   @user.school_info.update(end_date: DateTime.now)
    #   @user.update(school_info: new_school_info)
    # end
  # end

  private

  def load_user_school_info
    @user_school_info = UserSchoolInfo.find(params[:id])
  end

  def school_info_params
    # params.require(:school_info).permit(:school_type, :state, :school_name, :country)
    params.require(:school_info).permit(:school_type, :school_name, :country)
  end
end


## form empty
## No update to db
## treat as if exiting of cancelling


## form partially completed
## last seen school info interstitial will be updated (so form is shown to user in 7 days)
# update the row with fields that have been filled out (when user sees form again, fields populated)
# user school info row that will be updated


## form complete
## all the required fields in the form are filled out
## update end date & last confirmation date in user school infos table
## update school_info_id in the users table
## Create a new row in the user school infos table that includes the new school_info id