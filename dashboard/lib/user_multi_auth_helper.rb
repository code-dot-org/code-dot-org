module UserMultiAuthHelper
  def migrate_to_multi_auth
    raise "Migration not implemented for provider #{provider}" unless
      provider.nil? ||
      %w(manual migrated sponsored).include?(provider) ||
      AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include?(provider)

    return true if migrated?

    unless sponsored?
      self.primary_authentication_option =
        if AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include? provider
          new_data = nil
          if oauth_token || oauth_token_expiration || oauth_refresh_token
            new_data = {
              oauth_token: oauth_token,
              oauth_token_expiration: oauth_token_expiration,
              oauth_refresh_token: oauth_refresh_token
            }.to_json
          end
          AuthenticationOption.new(
            user: self,
            email: email,
            hashed_email: hashed_email || '',
            credential_type: provider,
            authentication_id: uid,
            data: new_data
          )
        elsif hashed_email.present?
          AuthenticationOption.new(
            user: self,
            email: email,
            hashed_email: hashed_email || '',
            credential_type: AuthenticationOption::EMAIL,
          )
        end
    end
    self.provider = 'migrated'
    save
  end

  #
  # Currently assumes the user was previously migrated using migrate_to_multi_auth.
  #
  def demigrate_from_multi_auth
    return true unless migrated?

    credential_type = primary_authentication_option&.credential_type
    self.provider =
      if AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include? credential_type
        credential_type
      elsif sponsored?
        User::PROVIDER_SPONSORED
      elsif hashed_email.present? || parent_email.present?
        nil
      else
        User::PROVIDER_MANUAL
      end
    authentication_options.delete_all
    self.primary_authentication_option = nil
    save
  end
end
