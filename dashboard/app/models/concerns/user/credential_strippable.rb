# frozen_string_literal: true

# Concern for nuking every login credential off a user.
# Used today by DemoStudent on flag, and intended for any future this account
# "should never be able to sign in again" pathway.
module User::CredentialStrippable
  extend ActiveSupport::Concern

  # Authentication options are hard-deleted (not paranoia-soft-deleted) so
  # OAuth refresh tokens and hashed credentials don't linger in the database.
  # Clearing `encrypted_password` rotates Devise's authenticatable_salt,
  # which signs out any active sessions on the next request.
  def strip_login_credentials!
    update!(
      secret_words: nil,
      secret_picture_id: nil,
      encrypted_password: '',
      hashed_email: '',
      email: '',
      provider: nil,
      uid: nil,
      primary_contact_info_id: nil,
    )
    authentication_options.with_deleted.each(&:really_destroy!)
  end
end
