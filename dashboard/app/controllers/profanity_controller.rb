require 'cdo/honeybadger'

class ProfanityController < ApplicationController
  include ProfanityHelper

  # Allowed number of unique requests per minute before that client is throttled.
  # These values are fallbacks for DCDO-configured values used below.
  REQUEST_LIMIT_PER_MIN_DEFAULT = 100
  REQUEST_LIMIT_PER_MIN_IP = 1000

  # POST /profanity/find
  # Detects profanity within the given text (+ optional locale). This endpoint is throttled because it
  # uses a paid third-party service (Webpurify) but needs to be accessed by unauthenticated users.
  # Throttling is done per-user when possible (via current_user.id or session.id) and falls back to
  # IP otherwise.
  # @param [String] params[:text] String to test
  # @param [String] params[:locale] Locale to test in. Optional. Uses request locale if not provided.
  # @returns [Array<String>|nil] Profane words within the given string
  def find
    id = current_user&.id || session.id
    # Only throttle by IP if no user or session ID is available.
    throttle_ip = id.blank?
    id ||= request.ip
    limit = throttle_ip ?
      DCDO.get('profanity_request_limit_per_min_ip', REQUEST_LIMIT_PER_MIN_IP) :
      DCDO.get('profanity_request_limit_per_min_default', REQUEST_LIMIT_PER_MIN_DEFAULT)
    period = 60

    text_to_check = params[:text]&.to_s
    text_to_check = ShareFiltering.extract_text_from_js(text_to_check) if should_extract_text_from_js?

    ProfanityHelper.throttled_find_profanities(text_to_check, locale, id, limit, period) do |profanities|
      return render json: profanities
    end

    # If we make it here, the request should be throttled.
    head :too_many_requests
  end

  private def locale
    params[:locale] || request.locale
  end

  private def should_extract_text_from_js?
    ActiveModel::Type::Boolean.new.cast(params[:extractTextFromJs])
  end
end
