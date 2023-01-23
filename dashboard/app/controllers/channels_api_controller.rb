# API routes ported from legacy/middleware/channels_api.rb

class ChannelsApiController < ApplicationController
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

  # POST /v3/channels/:channel_id/abuse
  # Increment an abuse score.
  def update_abuse
    # Reports of abuse from verified teachers are more reliable than reports
    # from students so we increase the abuse score enough to block the project
    # with only one report from a verified teacher.
    #
    # Temporarily ignore anonymous reports and only allow verified teachers
    # and signed in users to report.
    restrict_reporting_to_verified_users = DCDO.get('restrict-abuse-reporting-to-verified', true)
    amount =
      if verified_teacher?
        20
      elsif current_user && !restrict_reporting_to_verified_users
        10
      else
        0
      end
    begin
      value = Projects.new(get_storage_id).increment_abuse(id, amount)
    rescue ArgumentError, OpenSSL::Cipher::CipherError
      raise ActionController::BadRequest.new, "Bad channel_id"
    end
    render json: {abuse_score: value}
  end
end
