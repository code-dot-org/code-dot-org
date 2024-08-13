require 'cdo/firehose'

class Api::V1::UsersController < Api::V1::JSONApiController
  before_action :load_user
  skip_before_action :verify_authenticity_token
  skip_before_action :load_user, only: [:current, :netsim_signed_in, :post_sort_by_family_name, :cached_page_auth_redirect, :post_show_progress_table_v2, :post_ai_rubrics_disabled, :post_date_progress_table_invitation_last_delayed, :post_has_seen_progress_table_v2_invitation, :get_current_permissions, :post_disable_lti_roster_sync, :update_ai_tutor_access]
  skip_before_action :clear_sign_up_session_vars, only: [:current]

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
        uuid: current_user.uuid,
        username: current_user.username,
        user_type: current_user.user_type,
        is_signed_in: true,
        short_name: current_user.short_name,
        is_verified_instructor: current_user.verified_instructor?,
        is_lti: Policies::Lti.lti?(current_user),
        mute_music: current_user.mute_music?,
        under_13: current_user.under_13?,
        over_21: current_user.over_21?,
        sort_by_family_name: current_user.sort_by_family_name?,
        show_progress_table_v2: current_user.show_progress_table_v2,
        ai_rubrics_disabled: current_user.ai_rubrics_disabled,
        progress_table_v2_closed_beta: current_user.progress_table_v2_closed_beta?,
        ai_tutor_access_denied: !!current_user.ai_tutor_access_denied,
        has_seen_progress_table_v2_invitation: current_user.has_seen_progress_table_v2_invitation?,
        date_progress_table_invitation_last_delayed: current_user.date_progress_table_invitation_last_delayed,
        child_account_compliance_state: current_user.child_account_compliance_state,
        country_code: helpers.country_code(current_user, request),
        us_state_code: current_user.us_state_code,
        in_section: current_user.student? ? current_user.sections_as_student.present? : nil,
        created_at: current_user.created_at,
      }
    else
      render json: {
        is_signed_in: false
      }
    end
  end

  # GET /api/v1/users/netsim_signed_in
  def netsim_signed_in
    prevent_caching
    if current_user
      render json: {
        id: current_user.id,
        name: current_user.short_name,
        is_admin: current_user.admin,
        is_signed_in: true,
        owned_sections: current_user.owned_section_ids,
      }
    else
      raise CanCan::AccessDenied
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

  # This is used as a way to redirect correctly to either the sign in page or the
  # URL specified in the user_return_to parameter. This is necessary because
  # cached pages do not have a valid user auth token and therefore will attempt to
  # redirect to the sign in page instead of the correct page if the user is signed in.
  # See https://codedotorg.atlassian.net/browse/TEACH-758 for more details.
  # GET /api/v1/users/cached_page_auth_redirect
  def cached_page_auth_redirect
    # We must ensure that we remove any redirections to this page or we would enter
    # an infinite loop.
    [params, session].each do |context|
      context[:user_return_to] = nil if context[:user_return_to]&.include?('cached_page_auth_redirect')
    end

    if user_signed_in?
      redirect_to params[:user_return_to] || home_url
    else
      session[:user_return_to] ||= params[:user_return_to]
      authenticate_user!
    end
  end

  # GET /api/v1/users/<user_id>/using_text_mode
  def get_using_text_mode
    render json: {using_text_mode: !!@user&.using_text_mode}
  end

  # GET /api/v1/users/<user_id>/display_theme
  def get_display_theme
    render json: {display_theme: @user&.display_theme}
  end

  # GET /api/v1/users/<user_id>/mute_music
  def get_mute_music
    render json: {mute_music: !!@user&.mute_music}
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

  # GET /api/v1/users/current/permissions
  def get_current_permissions
    prevent_caching
    if current_user
      render json: {
        permissions: current_user.permissions.map(&:permission)
      }
    else
      render json: {
        permissions: []
      }
    end
  end

  # POST /api/v1/users/<user_id>/using_text_mode
  def post_using_text_mode
    @user.using_text_mode = !!params[:using_text_mode].try(:to_bool)
    @user.save

    render json: {using_text_mode: !!@user&.using_text_mode}
  end

  # POST /api/v1/users/<user_id>/mute_music
  def post_mute_music
    @user.mute_music = !!params[:mute_music].try(:to_bool)
    @user.save

    render json: {mute_music: !!@user&.mute_music}
  end

  # POST /api/v1/users/sort_by_family_name
  def post_sort_by_family_name
    return head :unauthorized unless current_user

    current_user.sort_by_family_name = !!params[:sort_by_family_name].try(:to_bool)
    current_user.save

    head :no_content
  end

  # POST /api/v1/users/show_progress_table_v2
  def post_show_progress_table_v2
    return head :unauthorized unless current_user

    show_v2_arg = !!params[:show_progress_table_v2].try(:to_bool)
    current_user.show_progress_table_v2 = show_v2_arg

    if show_v2_arg
      current_user.progress_table_v2_timestamp = DateTime.now
    else
      current_user.progress_table_v1_timestamp = DateTime.now
    end
    current_user.save!

    head :no_content
  end

  # POST /api/v1/users/has_seen_progress_table_v2_invitation
  def post_has_seen_progress_table_v2_invitation
    return head :unauthorized unless current_user

    current_user.has_seen_progress_table_v2_invitation = !!params[:has_seen_progress_table_v2_invitation].try(:to_bool)

    show_v2_arg = !!params[:show_progress_table_v2].try(:to_bool)
    current_user.show_progress_table_v2 = show_v2_arg

    if show_v2_arg
      current_user.progress_table_v2_timestamp = DateTime.now
    end

    current_user.save!

    head :no_content
  end

  # POST /api/v1/users/date_progress_table_invitation_last_delayed
  def post_date_progress_table_invitation_last_delayed
    return head :unauthorized unless current_user

    current_user.date_progress_table_invitation_last_delayed = params[:date_progress_table_invitation_last_delayed]
    current_user.save

    head :no_content
  end

  # POST /api/v1/users/ai_rubrics_disabled
  def post_ai_rubrics_disabled
    return head :unauthorized unless current_user

    current_user.ai_rubrics_disabled = !!params[:ai_rubrics_disabled].try(:to_bool)
    current_user.save

    head :no_content
  end

  # POST /api/v1/users/disable_lti_roster_sync
  def post_disable_lti_roster_sync
    return head :unauthorized unless current_user&.teacher?

    current_user.lti_roster_sync_enabled = false
    current_user.save

    head :no_content
  end

  # POST /api/v1/users/<user_id>/display_theme
  def update_display_theme
    @user.display_theme = params[:display_theme]
    @user.save

    render json: {display_theme: @user.display_theme}
  end

  # POST /api/v1/users/<user_id>/ai_tutor_access
  def update_ai_tutor_access
    return head :unauthorized unless current_user&.teacher?
    target_user = User.find_by_id(params[:user_id])

    unless target_user&.student_of?(current_user)
      return head :unauthorized
    end

    target_user.ai_tutor_access_denied = !to_bool(params[:ai_tutor_access])
    target_user.save

    head :no_content
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
    today = Time.zone.today
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

    render status: :ok, json: {next_census_display: @user.next_census_display}
  end

  # POST /api/v1/users/<user_id>/dismiss_census_banner
  def dismiss_census_banner
    today = Time.zone.today
    year = today.year

    # if they dismiss Aug 1 or later then don't show until next November
    year += 1 if today.month >= 8

    @user.next_census_display = Date.new(year, 11, 15)
    @user.save

    render status: :ok, json: {next_census_display: @user.next_census_display}
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

  # Expects a param with the key "g-recaptcha-response" that is used
  # to validate whether a user isn't a bot
  # POST /dashboardapi/v1/users/<user_id>/verify_captcha
  def verify_captcha
    if verify_recaptcha
      @user.last_verified_captcha_at = Time.now.utc
      @user.save

      return head :ok
    else
      return head :bad_request
    end
  end

  private def to_bool(val)
    ActiveModel::Type::Boolean.new.cast val
  end
end
