module Services
  module User
    class MultiAuthMigrator < Services::Base
      attr_reader :user, :provider

      def initialize(user:)
        @user = user
        @provider = user.provider
      end

      def call
        raise "Migration not implemented for provider #{provider}" unless provider_supported?

        return true if user.migrated?

        # Add the user's new auth option, but do not set it as primary contact info.
        # Primary contact info will be set automatically in an after_create hook.
        user.authentication_options = [migrated_auth_option] unless user.sponsored?

        user.provider = 'migrated'
        user.uid = nil
        user.oauth_token = nil
        user.oauth_token_expiration = nil
        user.oauth_refresh_token = nil
        user
      end

      private def oauth_provider?
        AuthenticationOption::OAUTH_CREDENTIAL_TYPES.include?(provider)
      end

      private def provider_supported?
        provider.nil? ||
          %w(manual migrated sponsored).include?(provider) ||
          oauth_provider?
      end

      private def oauth_token_json
        token_fields = [:oauth_token, :oauth_token_expiration, :oauth_refresh_token]
        if token_fields.any? {|f| user.send(f).present?}
          return {
            oauth_token: user.oauth_token,
            oauth_token_expiration: user.oauth_token_expiration,
            oauth_refresh_token: user.oauth_refresh_token
          }.to_json
        end
      end

      private def migrated_auth_option
        ao = AuthenticationOption.new(
          email: user.email,
          hashed_email: user.hashed_email || '',
        )
        if oauth_provider?
          ao.credential_type = provider
          ao.authentication_id = user.uid
          ao.data = oauth_token_json
        elsif user.email.present? || user.hashed_email.present?
          ao.credential_type = AuthenticationOption::EMAIL
        else
          return nil
        end
        ao
      end
    end
  end
end
