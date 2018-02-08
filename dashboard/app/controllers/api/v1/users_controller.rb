require 'cdo/firehose'

class Api::V1::UsersController < Api::V1::JsonApiController
  before_action :load_user
  skip_before_action :verify_authenticity_token

  def load_user
    user_id = params[:user_id]
    if current_user.nil? || (user_id != 'me' && user_id.to_i != current_user.id)
      raise CanCan::AccessDenied
    end
    @user = current_user
  end

  # GET /api/v1/users/<user_id>/using_text_mode
  def get_using_text_mode
    render json: {using_text_mode: !!@user.using_text_mode}
  end

  # POST /api/v1/users/<user_id>/using_text_mode
  def post_using_text_mode
    @user.using_text_mode = !!params[:using_text_mode].try(:to_bool)
    @user.save

    render json: {using_text_mode: !!@user.using_text_mode}
  end

  # POST /api/v1/users/<user_id>/post_ui_tip_dismissed
  def post_ui_tip_dismissed
    property_name = "ui_tip_dismissed_" + params[:tip]
    @user.send("#{property_name}=", true)
    @user.save

    render status: 200, json: {set: property_name}
  end

  # POST /api/v1/users/<user_id>/postpone_census_banner
  def postpone_census_banner
    today = Date.today
    year = today.year
    # Find the next scheduled date that is at least 2 weeks away
    scheduled_display_dates = [
      Date.new(year, 2, 8),
      Date.new(year, 3, 15),
      Date.new(year, 5, 15),
      Date.new(year, 11, 15),
      Date.new(year + 1, 2, 8),
    ]
    next_date = scheduled_display_dates.select {|d| d > today && d > today + 2.weeks} [0]

    @user.next_census_display = next_date
    @user.save

    render status: 200, json: {next_census_display: @user.next_census_display}
  end

  # POST /api/v1/users/<user_id>/dismiss_census_banner
  def dismiss_census_banner
    today = Date.today
    year = today.year

    # if they dismiss Aug 1 or later then don't show until next November
    year += 1 if today.month >= 8

    @user.next_census_display = Date.new(year, 11, 15)
    @user.save

    render status: 200, json: {next_census_display: @user.next_census_display}
  end
end
