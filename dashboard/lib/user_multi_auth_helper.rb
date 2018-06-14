module UserMultiAuthHelper
  def migrate_to_multi_auth
    return if provider == 'migrated'
    self.primary_authentication_option = AuthenticationOption.new(
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
    self.provider = 'migrated'
    save
  end
end
