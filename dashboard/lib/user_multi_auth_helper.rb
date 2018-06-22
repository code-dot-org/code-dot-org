module UserMultiAuthHelper
  def migrate_to_multi_auth
    raise "Migration not implemented for provider #{provider}" unless
      provider.nil? ||
      %w(
        clever
        facebook
        google_oauth2
        manual
        migrated
        powerschool
        sponsored
        windowslive
      ).include?(provider)

    return true if migrated?

    unless sponsored?
      self.primary_authentication_option =
        if %w(clever facebook google_oauth2 powerschool windowslive).include? provider
          AuthenticationOption.new(
            user: self,
            email: email,
            hashed_email: hashed_email || '',
            credential_type: provider,
            authentication_id: uid,
            data: {
              oauth_token: oauth_token,
              oauth_token_expiration: oauth_token_expiration,
              oauth_refresh_token: oauth_refresh_token
            }.to_json
          )
        elsif hashed_email.present?
          AuthenticationOption.new(
            user: self,
            email: email,
            hashed_email: hashed_email || '',
            credential_type: 'email',
          )
        end
    end
    self.provider = 'migrated'
    save
  end
end
