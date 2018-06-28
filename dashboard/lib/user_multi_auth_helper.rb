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

  def clear_single_auth_fields
    raise "Single auth fields may not be cleared on an unmigrated user" unless migrated?
    self.email = ''
    self.hashed_email = nil
    self.uid = nil
    self.oauth_token = nil
    self.oauth_token_expiration = nil
    self.oauth_refresh_token = nil
    save
  end

  def demigrate_from_multi_auth
    return true unless migrated?

    self.email = email
    self.hashed_email = hashed_email.present? ? hashed_email : nil

    credential_type = primary_authentication_option&.credential_type
    if AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include? credential_type
      self.provider = credential_type
      self.uid = primary_authentication_option.authentication_id
      data = primary_authentication_option.data_hash
      self.oauth_token = data[:oauth_token]
      self.oauth_token_expiration = data[:oauth_token_expiration]
      self.oauth_refresh_token = data[:oauth_refresh_token]
    elsif sponsored?
      self.provider = User::PROVIDER_SPONSORED
    elsif hashed_email.present? || parent_email.present?
      self.provider = nil
    else
      self.provider = User::PROVIDER_MANUAL
    end

    authentication_options.delete_all
    save
  end
end
