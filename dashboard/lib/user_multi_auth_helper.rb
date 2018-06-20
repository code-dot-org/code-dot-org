module UserMultiAuthHelper
  def migrate_to_multi_auth
    return true if migrated?

    unless sponsored? || provider == User::PROVIDER_MANUAL
      self.primary_authentication_option =
        if provider == 'google_oauth2'
          AuthenticationOption.new(
            user: self,
            email: email,
            credential_type: provider,
            authentication_id: uid,
            data: {
              oauth_token: oauth_token,
              oauth_token_expiration: oauth_token_expiration,
              oauth_refresh_token: oauth_refresh_token
            }.to_json
          )
        else
          AuthenticationOption.new(
            user: self,
            email: email,
            hashed_email: hashed_email,
            credential_type: 'email',
          )
        end
    end
    self.provider = 'migrated'
    save
  end
end
