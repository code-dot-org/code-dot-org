require 'securerandom'

module Devise
  # https://makandracards.com/makandra/53562-devise-invalidating-all-sessions-for-a-user
  module ManualSessionExpiration
    extend ActiveSupport::Concern

    included do
      serialized_attrs('session_expiration_token')
    end

    # Extend Devise's existing `authenticatable_salt` method to incorporate the
    # session expiration token into the salt, which will force existing
    # sessions to reauthenticate when the expiration token is updated.
    # @override https://github.com/heartcombo/devise/blob/v4.9.3/lib/devise/models/database_authenticatable.rb#L175-L178
    def authenticatable_salt
      "#{super}::#{session_expiration_token}"
    end

    # Expire all existing sessions by updating the session expiration token to
    # a new randomly-generated value, resulting in a new salt value and forcing
    # all existing sessions to reauthenticate.
    def expire_all_sessions!
      update!(session_expiration_token: SecureRandom.hex)
    end
  end
end
