require 'cdo/shared_cache'

# Persist user attributes into the session and/or a shared cache during a multi-step
# registration process.
#
# This concern assumes it will be included on User.
module PartialRegistration
  extend ActiveSupport::Concern

  USER_ATTRIBUTES_SESSION_KEY = 'devise.user_attributes'

  module ClassMethods
    def partial_registration?(session)
      !!session[USER_ATTRIBUTES_SESSION_KEY]
    end

    def new_from_partial_registration(session)
      raise 'No partial registration was in progress' unless partial_registration? session
      new(session[USER_ATTRIBUTES_SESSION_KEY]) do |user|
        cache = CDO.shared_cache
        OmniauthCallbacksController::OAUTH_PARAMS_TO_STRIP.each do |param|
          next if user.send(param)
          # Grab the oauth token from memcached if it's there
          oauth_cache_key = OmniauthCallbacksController.get_cache_key(param, user)
          user.send("#{param}=", cache.read(oauth_cache_key)) if cache
        end
        yield user if block_given?
        user.valid?
      end
    end
  end
end
