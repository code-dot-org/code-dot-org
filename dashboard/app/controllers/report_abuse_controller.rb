require 'json'
require 'httparty'

UNKNOWN_ACCOUNT_ZENDESK_REPORT_EMAIL = 'automated_abuse_report@code.org'

class ZendeskError < StandardError
  attr_reader :error_details

  def initialize(code, error_details)
    @error_details = error_details
    super("Zendesk failed with response code: #{code}")
  end
end

class ReportAbuseController < ApplicationController
  AGE_CUSTOM_FIELD_ID = 24_024_923

  # Projects that are created by users with project validator permissions are
  # blocked from abuse reports because they are created internally and we know
  # they are safe. This reduces spamming of the report abuse feature.
  def protected_project?
    return false if params[:channel_id].blank?
    owner_storage_id, _ = storage_decrypt_channel_id(params[:channel_id])
    owner_user_id = user_id_for_storage_id(owner_storage_id)
    return false unless owner_user_id
    project_owner = User.find(owner_user_id)
    project_owner.permission?(UserPermission::PROJECT_VALIDATOR)
  end

  def report_abuse
    unless protected_project?
      unless verify_recaptcha || !require_captcha?
        flash[:alert] = I18n.t('project.abuse.report_abuse_form.validation.captcha')
        redirect_to report_abuse_path
        return
      end

      send_abuse_report(
        current_user&.name || '',
        params[:email],
        params[:age],
        params[:abuse_url],
        current_user&.username
      )
      update_abuse_score
    end
    redirect_to "https://support.code.org"
  end

  def report_abuse_form
    @react_props = {
      email: current_user&.email,
      age: current_user&.age,
      requireCaptcha: require_captcha?,
      captchaSiteKey: CDO.recaptcha_site_key,
    }
  end

  # API routes, moved from legacy channels_api.rb and files_api.rb.

  # GET /v3/channels/:channel_id/abuse
  # Get an abuse score.
  def show_abuse
    begin
      value = Projects.get_abuse(params[:channel_id])
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      raise ActionController::BadRequest.new, "Bad channel_id"
    end
    render json: {abuse_score: value}
  end

  # DELETE /v3/channels/:channel_id/abuse
  # POST /v3/channels/:channel_id/abuse/delete
  # Clear an abuse score. Requires project_validator permission
  def reset_abuse
    return head :unauthorized unless can?(:destroy_abuse, nil)

    channel_id = params[:channel_id]

    begin
      value = Projects.new(get_storage_id).reset_abuse(channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      raise ActionController::BadRequest.new, "Bad channel_id"
    end
    render json: {abuse_score: value}
  end

  # PATCH /v3/(animations|assets|sources|files|libraries)/:channel_id?abuse_score=:abuse_score
  def update_file_abuse
    return head :unauthorized unless can?(:update_file_abuse, nil)

    value = update_file_abuse_score(params[:endpoint], params[:encrypted_channel_id], params[:abuse_score])

    render json: {abuse_score: value}
  end

  # Non-actions, public methods so they can be tested easier.
  # The methods below are in this controller because they depend on the
  # storage_id helper, which has dependencies on current_user.

  # Increment an abuse score.
  # Was POST /v3/channels/:channel_id/abuse
  def update_channel_abuse_score(channel_id)
    # Reports of abuse from verified teachers are more reliable than reports
    # from students so we increase the abuse score enough to block the project
    # with only one report from a verified teacher.
    #
    # Temporarily ignore anonymous reports and only allow verified teachers
    # and signed in users to report.
    restrict_reporting_to_verified_users = DCDO.get('restrict-abuse-reporting-to-verified', true)
    amount =
      if current_user&.verified_teacher?
        20
      elsif current_user && !restrict_reporting_to_verified_users
        10
      else
        0
      end
    begin
      value = Projects.new(get_storage_id).increment_abuse(channel_id, amount)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      raise ActionController::BadRequest.new, "Bad channel_id"
    end
    value
  end

  # Update all assets for the given channelId to have the provided abuse score
  # Was PATCH /v3/(animations|assets|sources|files|libraries)/:channel_id?abuse_score=<abuse_score>
  def update_file_abuse_score(endpoint, encrypted_channel_id, abuse_score)
    return if abuse_score.nil?

    buckets = get_bucket_impl(endpoint).new

    begin
      files = buckets.list(encrypted_channel_id)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      raise ActionController::BadRequest.new, "Bad channel_id"
    end
    files.each do |file|
      break unless can_update_abuse_score?(endpoint, encrypted_channel_id, file[:filename], abuse_score)
      buckets.replace_abuse_score(encrypted_channel_id, file[:filename], abuse_score)
    end

    abuse_score
  end

  private def send_abuse_report(name, email, age, abuse_url, username)
    unless Rails.env.development? || Rails.env.test?
      subject = FeaturedProject.featured_channel_id?(params[:channel_id]) ?
        'Featured Project: Abuse Reported' :
        'Abuse Reported'
      response = HTTParty.post(
        'https://codeorg.zendesk.com/api/v2/tickets.json',
        headers: {"Content-Type" => "application/json", "Accept" => "application/json"},
        body: {
          ticket: {
            requester: {
              name: (name == '' ? email : name),
              email: email
            },
            subject: subject,
            comment: {
              body: [
                "URL: #{abuse_url}",
                "username: #{username}",
                "abuse type: #{params[:abuse_type]}",
                "user detail:",
                params[:abuse_detail]
              ].join("\n")
            },
            custom_fields: [{id: AGE_CUSTOM_FIELD_ID, value: age}],
            tags: (params[:abuse_type] == 'infringement' ? ['report_abuse', 'infringement'] : ['report_abuse'])
          }
        }.to_json,
        basic_auth: {username: 'dev@code.org/token', password: Dashboard::Application.config.zendesk_dev_token}
      )
      raise ZendeskError.new(response.code, response.body) unless response.success?
    end
  end

  private def update_abuse_score
    if params[:channel_id].present?
      channel_id = params[:channel_id]

      abuse_score = update_channel_abuse_score(channel_id)

      update_file_abuse_score('assets', channel_id, abuse_score)
      update_file_abuse_score('files', channel_id, abuse_score)
    end
  end

  private def get_bucket_impl(endpoint)
    case endpoint
    when 'animations'
      AnimationBucket
    when 'assets'
      AssetBucket
    when 'files'
      FileBucket
    when 'sources'
      SourceBucket
    when 'libraries'
      LibraryBucket
    else
      raise ActionController::RoutingError, 'Not Found'
    end
  end

  private def can_update_abuse_score?(endpoint, encrypted_channel_id, filename, new_score)
    return true if current_user&.project_validator? || new_score.nil?

    get_bucket_impl(endpoint).new.get_abuse_score(encrypted_channel_id, filename) <= new_score.to_i
  end

  private def require_captcha?
    return false if current_user&.admin? || current_user&.project_validator?
    true
  end
end
