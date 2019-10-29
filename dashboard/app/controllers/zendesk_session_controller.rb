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
      @error = I18n.t('zendesk_too_young_message_md', support_url: "support.code.org", markdown: true)
      return false
    end
    # Prevent a vulnerability where a user can sign up with a code.org email and then see tickets that
    # that employee has been CC'ed on (or has responded to). Effectively, this is requiring email
    # verification for Code.org employees accessing Zendesk.
    if user.email && Mail::Address.new(user.email).domain == "code.org" && !user.verified_cdo_internal?
      @error = I18n.t('zendesk_unverified_codeorg_account_message')
      return false
    end
    # Change our controller that does Single Sign On from Code Studio to ZenDesk to do nothing for
    # external users (non @code.org users).  It would just redirect them to support.code.org and they
    # would use it as an anonymous / non-authenticated user.
    if user.email.present? && Mail::Address.new(user.email).domain != "code.org"
      redirect_to "https://support.code.org"
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
