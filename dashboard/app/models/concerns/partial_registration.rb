require 'cdo/shared_cache'
require 'policies/user'

# Persist user attributes into the session and/or a shared cache during a multi-step
# registration process.
#
# This concern assumes it will be included on User.
module PartialRegistration
  extend ActiveSupport::Concern

  SESSION_KEY = 'partial_registration'

  module ClassMethods
    def new_from_partial_registration(session, &block)
      raise 'No partial registration was in progress' unless PartialRegistration.in_progress? session
      cache_key = session[SESSION_KEY]
      json = CDO.shared_cache.read(cache_key)
      attributes = JSON.parse(json)
      user = new(attributes, &block)
      if user.primary_contact_info.nil?
        user.primary_contact_info = user.authentication_options&.first
      end
      user
    end
  end

  def self.can_finish_signup?(params, session)
    params&.dig(:user, :email).present? && in_progress?(session)
  end

  def self.in_progress?(session)
    session[SESSION_KEY] && CDO.shared_cache.exist?(session[SESSION_KEY])
  end

  def self.persist_attributes(session, user)
    # Push the potential user's attributes into our application cache.
    cache_key = PartialRegistration.cache_key(user)
    user_attributes = Policies::User.user_attributes(user)

    CDO.shared_cache.write(cache_key, user_attributes.to_json, expires_in: 8.hours)

    # Put the cache key into the session, to
    # 1. track that a partial registration is in progress
    # 2. retrieve the attributes later when we're ready to persist the user
    session[SESSION_KEY] = cache_key
  end

  def self.delete(session)
    # On production, it's unsafe to delete(nil) from the cache, so check that
    # we actually have a partial registration before we try to clear it.
    return unless in_progress? session
    CDO.shared_cache.delete(session[SESSION_KEY])
    session.delete(SESSION_KEY)
  end

  def self.get_provider(session)
    # Extract the provider name from the cache key to avoid actually
    # interacting with the cache or doing deserialization.
    # Assumption: Provider names will not contain hyphens
    cache_key = session[SESSION_KEY]
    /^([^-]+)-.+-partial-sso.*$/.match(cache_key)&.captures&.first
  end

  def self.cache_key(user)
    if user.migrated? && user.authentication_options.present?
      ao = user.authentication_options.first
      "#{ao.credential_type}-#{ao.authentication_id}-partial-sso-migrated"
    elsif user.uid.present?
      "#{user.provider}-#{user.uid}-partial-sso"
    else
      "#{User.hash_email(user.email)}-partial-email"
    end
  end
end
