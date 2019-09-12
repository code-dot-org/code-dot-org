# Support single sign on from zendesk via JWT: https://support.zendesk.com/entries/23675367
# Most of this code is copied from: https://github.com/zendesk/zendesk_jwt_sso_examples

require 'securerandom' unless defined?(SecureRandom)

class ZendeskSessionController < ApplicationController
  before_action :authenticate_user!

  SECRET = Dashboard::Application.config.zendesk_secret
  SUBDOMAIN = Dashboard::Application.config.zendesk_subdomain

  @error = nil

  def index
    if allow_zendesk_signin?(current_user)
      sign_into_zendesk(current_user)
      return
    end
  end

  private

  def allow_zendesk_signin?(user)
    if user.age && user.under_13?
      @error = I18n.t('zendesk_too_young_message', support_url: "support.code.org", markdown: true)
      return false
    end
    if user.email && Mail::Address.new(user.email).domain == "code.org" && !user.google_oauth_email_matches?
      @error = I18n.t('zendesk_unverified_codeorg_account_message')
      return false
    end
    return true
  end

  def configured?
    SECRET.present? && SUBDOMAIN.present?
  end

  def sign_into_zendesk(user)
    # This is the meat of the business, set up the parameters you wish
    # to forward to Zendesk. All parameters are documented in this page.
    iat = Time.now.to_i
    jti = "#{iat}/#{SecureRandom.hex(18)}"

    payload = JWT.encode(
      {
        iat: iat, # Seconds since epoch, determine when this token is stale
        jti: jti, # Unique token id, helps prevent replay attacks
        name: user.name,
        email: user.email,
      },
      SECRET
    )

    redirect_to zendesk_sso_url(payload)
  end

  def zendesk_sso_url(payload)
    url = "https://#{SUBDOMAIN}.zendesk.com/access/jwt?jwt=#{payload}"
    url += "&user_return_to=#{URI.escape(params['user_return_to'])}" if params["user_return_to"].present?
    url
  end
end
