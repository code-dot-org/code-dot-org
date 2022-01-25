require 'cdo/firehose'

class Api::V1::UsersController < Api::V1::JsonApiController
  before_action :load_user
  skip_before_action :verify_authenticity_token
  skip_before_action :load_user, only: [:current]

  def load_user
    user_id = params[:user_id]
    if current_user.nil? || (user_id != 'me' && user_id.to_i != current_user.id)
      raise CanCan::AccessDenied
    end
    @user = current_user
  end

  # GET /api/v1/users/current
  def current
    prevent_caching
    if current_user
      render json: {
        id: current_user.id,
        username: current_user.username,
        user_type: current_user.user_type,
        is_signed_in: true,
        short_name: current_user.short_name,
        is_verified_instructor: current_user.verified_instructor?
      }
    else
      render json: {
        is_signed_in: false
      }
    end
  end

  # GET /api/v1/users/<user_id>/school_name
  def get_school_name
    render json: {
      school_name: current_user&.school
    }
  end

  # GET /api/v1/users/<user_id>/contact_details
  def get_contact_details
    render json: {
      user_name: current_user&.name,
      email: current_user&.email,
      zip: current_user&.school_info&.school&.zip || current_user&.school_info&.zip,
    }
  end

  # GET /api/v1/users/<user_id>/using_text_mode
  def get_using_text_mode
    render json: {using_text_mode: !!@user.using_text_mode}
  end

  # GET /api/v1/users/<user_id>/display_theme
  def get_display_theme
    render json: {display_theme: @user&.display_theme}
  end

  # GET /api/v1/users/<user_id>/get_donor_teacher_banner_details
  def get_donor_teacher_banner_details
    if current_user.teacher?
      teachers_school = Queries::SchoolInfo.last_complete(current_user)&.school
      render json: {
        user_type: 'teacher',
        teacher_first_name: current_user.short_name,
        teacher_second_name: current_user.second_name,
        teacher_email: current_user.email,
        nces_school_id: teachers_school&.id,
        school_address_1: teachers_school&.address_line1,
        school_address_2: teachers_school&.address_line2,
        school_address_3: teachers_school&.address_line3,
        school_city: teachers_school&.city,
        school_state: teachers_school&.state,
        school_zip: teachers_school&.zip,
        afe_high_needs: teachers_school&.afe_high_needs?
      }
    else
      render json: {
        user_type: 'student'
      }
    end
  end

  # GET /api/v1/users/<user_id>/school_donor_name
  def get_school_donor_name
    render json: @user.school_donor_name.nil? ? 'null' : @user.school_donor_name.inspect
  end

  # GET /api/v1/users/<user_id>/tos_version
  def get_tos_version
    render json: @user.terms_of_service_version.nil? ? -1 : @user.terms_of_service_version.inspect
  end

  # POST /api/v1/users/<user_id>/using_text_mode
  def post_using_text_mode
    @user.using_text_mode = !!params[:using_text_mode].try(:to_bool)
    @user.save

    render json: {using_text_mode: !!@user.using_text_mode}
  end

  # POST /api/v1/users/<user_id>/display_theme
  def update_display_theme
    @user.display_theme = params[:display_theme]
    @user.save

    render json: {display_theme: @user.display_theme}
  end

  # POST /api/v1/users/accept_data_transfer_agreement
  def accept_data_transfer_agreement
    unless @user.data_transfer_agreement_accepted
      @user.data_transfer_agreement_accepted = true
      @user.data_transfer_agreement_at = DateTime.now
      @user.data_transfer_agreement_request_ip = request.ip
      @user.data_transfer_agreement_source = User::ACCEPT_DATA_TRANSFER_DIALOG
      @user.data_transfer_agreement_kind = "0"
      @user.save
    end

    head :no_content
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

  # POST /api/v1/users/<user_id>/dismiss_donor_teacher_banner
  def dismiss_donor_teacher_banner
    @user.donor_teacher_banner_dismissed = {
      participate: params[:participate].to_s == "true",
      source: params[:source]
    }
    @user.save

    head :ok
  end

  # POST /api/v1/users/<user_id>/dismiss_parent_email_banner
  def dismiss_parent_email_banner
    @user.parent_email_banner_dismissed = "true"
    @user.save

    head :ok
  end

  # POST /api/v1/users/<user_id>/set_standards_report_info_to_seen
  def set_standards_report_info_to_seen
    @user.has_seen_standards_report_info_dialog = true
    @user.save!
  end
end
