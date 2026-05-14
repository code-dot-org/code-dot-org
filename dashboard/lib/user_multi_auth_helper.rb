require 'cdo/honeybadger'

module UserMultiAuthHelper
  def oauth_tokens_for_provider(provider)
    if migrated?
      # Grab the most recently created authentication option with the
      # given credential type. This ensures we pull the newest token for
      # providers with multiple versions of authentication options (e.g. Clever v2 and v3).
      authentication_option = AuthenticationOption.where(
        credential_type: provider,
        user_id: id
      ).order(created_at: :desc).first
      authentication_option_data = authentication_option&.data_hash || {}
      {
        oauth_token: authentication_option_data[:oauth_token],
        oauth_token_expiration: authentication_option_data[:oauth_token_expiration],
        oauth_refresh_token: authentication_option_data[:oauth_refresh_token]
      }
    else
      {
        oauth_token: oauth_token,
        oauth_token_expiration: oauth_token_expiration,
        oauth_refresh_token: oauth_refresh_token
      }
    end
  end

  # Returns the authentication_id (uid) for the given provider.
  # If a version is provided, returns the authentication_id for the latest
  # authentication option matching that version. Otherwise, simply returns the uid
  # from the most recently created authentication option for the provider.
  # If no matching authentication option is found, returns nil.
  # Backwards compatible with pre-multi-auth users by returning the user's uid property.
  def uid_for_provider(provider, version = nil)
    if migrated?
      auth_options = authentication_options.where(credential_type: provider).order(created_at: :desc)
      authentication_option =
        if version.nil?
          auth_options.first
        else
          auth_options.find {|ao| ao.version == version}
        end

      authentication_option&.authentication_id
    else
      uid
    end
  end

  def update_oauth_credential_tokens(auth_hash)
    # No-op if auth_hash does not contain credentials
    return unless auth_hash.key?(:credentials)

    credentials_hash = auth_hash[:credentials]
    if migrated?
      # TODO: Delete this block once Clever users have been migrated to V3 auth options
      if auth_hash[:provider] == AuthenticationOption::CLEVER
        # We know for sure we don't need to check for staff here, because that role is not enabled in our Clever app settings.
        legacy_id = auth_hash.dig(:extra, :raw_info, :canonical, :data, :roles, :teacher, :legacy_id)
        auth_option = authentication_options.find_by(
          credential_type: AuthenticationOption::CLEVER,
          authentication_id: auth_hash[:uid]
        )
        if auth_option.nil? && legacy_id.present?
          auth_option = authentication_options.find_by(
            credential_type: AuthenticationOption::CLEVER,
            authentication_id: legacy_id
          )
        end
        auth_option&.update_oauth_credential_tokens(credentials_hash)
        return
      end
      # end TODO
      auth_option = authentication_options.find_by(credential_type: auth_hash[:provider], authentication_id: auth_hash[:uid])
      auth_option&.update_oauth_credential_tokens(credentials_hash)
    else
      self.oauth_refresh_token = credentials_hash[:refresh_token] if credentials_hash[:refresh_token].present?
      self.oauth_token = credentials_hash[:token]
      self.oauth_token_expiration = credentials_hash[:expires_at]

      save if changed?
    end
  end

  def migrate_to_multi_auth
    if DCDO.get('migration_service_enabled', false)
      Services::User::MultiAuthMigrator.call(user: self)
      return save!
    end

    raise "Migration not implemented for provider #{provider}" unless
      provider.nil? ||
        %w(manual migrated sponsored).include?(provider) ||
        AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include?(provider)

    return true if migrated?

    unless sponsored?
      self.primary_contact_info =
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
    self.uid = nil
    self.oauth_token = nil
    self.oauth_token_expiration = nil
    self.oauth_refresh_token = nil
    save!
    reload
  end

  def demigrate_from_multi_auth
    return true unless migrated?

    self.email = email
    self.hashed_email = hashed_email.presence

    credential_type = primary_contact_info&.credential_type
    if AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include? credential_type
      self.provider = credential_type
      self.uid = primary_contact_info.authentication_id
      data = primary_contact_info.data_hash
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
    reload
  end
end
