require 'cdo/shared_cache'

# Persist user attributes into the session and/or a shared cache during a multi-step
# registration process.
#
# This concern assumes it will be included on User.
module PartialRegistration
  extend ActiveSupport::Concern

  USER_ATTRIBUTES_SESSION_KEY = 'devise.user_attributes'
  OAUTH_PARAMS_TO_STRIP = %w(oauth_token oauth_refresh_token)

  module ClassMethods
    def new_from_partial_registration(session)
      raise 'No partial registration was in progress' unless PartialRegistration.in_progress? session
      new(session[USER_ATTRIBUTES_SESSION_KEY]) do |user|
        cache = CDO.shared_cache
        OAUTH_PARAMS_TO_STRIP.each do |param|
          next if user.send(param)
          # Grab the oauth token from memcached if it's there
          oauth_cache_key = PartialRegistration.cache_key(param, user)
          user.send("#{param}=", cache.read(oauth_cache_key)) if cache
        end
        yield user if block_given?
        user.valid?
      end
    end
  end

  def self.in_progress?(session)
    !!session[USER_ATTRIBUTES_SESSION_KEY]
  end

  def self.persist_attributes(session, user)
    user = user.dup
    # Because some oauth tokens are quite large, we strip them from the session
    # variables and pass them through via the cache instead - they are pulled out again
    # in new_from_partial_registration
    cache = CDO.shared_cache
    if cache
      OAUTH_PARAMS_TO_STRIP.each do |param|
        param_value = user.attributes['properties'].delete(param)
        cache_key = PartialRegistration.cache_key(param, user)
        cache.write(cache_key, param_value)
      end
    end
    session[USER_ATTRIBUTES_SESSION_KEY] = user.attributes
  end

  def self.cache_key(oauth_param, user)
    "#{oauth_param}-#{user.email}"
  end
end
