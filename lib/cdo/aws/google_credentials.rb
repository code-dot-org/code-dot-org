require 'aws-sdk'
require 'googleauth'
require 'google/api_client/auth/storage'
require 'google/api_client/auth/storages/file_store'
require 'google/api_client/auth/installed_app'
require 'active_support/core_ext/hash/slice'
require 'active_support/core_ext/module/attribute_accessors'

module Cdo
  # Insert GoogleCredentials into the default AWS credential provider chain.
  # Google credentials will only be used if GoogleCredentials.config is set before initialization.
  module GoogleCredentialProvider
    # Insert google_credentials as the second-to-last credentials provider
    # (in front of instance profile, which makes an http request).
    def providers
      super.insert(-2, [:google_credentials, {}])
    end

    def google_credentials(options)
      if (config = GoogleCredentials.config)
        GoogleCredentials.new(options.merge(config))
      else
        nil
      end
    end
  end
  Aws::CredentialProviderChain.prepend GoogleCredentialProvider

  # An auto-refreshing credential provider that works by assuming
  # a role via {Aws::STS::Client#assume_role_with_web_identity},
  # using an ID token derived from a Google refresh token.
  #
  #     role_credentials = AWS::GoogleCredentials.new(
  #       role_arn: "arn:aws:iam::[account]:role/[IamRole]",
  #       google_id: Google::Auth::ClientId.new(client_id, client_secret)
  #     )
  #
  #     ec2 = Aws::EC2::Client.new(credentials: role_credentials)
  #
  # If you omit `:client` option, a new {STS::Client} object will be
  # constructed.
  class GoogleCredentials
    include Aws::CredentialProvider
    include Aws::RefreshingCredentials

    mattr_accessor :config

    # @option options [required, String] :role_arn
    # @option options [String] :policy
    # @option options [Integer] :duration_seconds
    # @option options [String] :external_id
    # @option options [STS::Client] :client STS::Client to use (default: create new client)
    # @option options [String] :profile AWS Profile to store temporary credentials (default `cdo`)
    # @option options [Google::Auth::ClientId] :google_id
    def initialize(options = {})
      @oauth_attempted = false
      @assume_role_params = options.slice(
        *Aws::STS::Client.api.operation(:assume_role_with_web_identity).
          input.shape.member_names
      )

      @profile = options[:profile] || ENV['AWS_DEFAULT_PROFILE'] || 'default'
      @google_id = Google::Auth::ClientId.new(
        options[:google_client_id],
        options[:google_client_secret]
      )
      @client = options[:client] || Aws::STS::Client.new(credentials: nil)

      # Use existing AWS credentials stored in the shared config if available.
      # If this is `nil` or expired, #refresh will be called on the first AWS API service call
      # to generate AWS credentials derived from Google authentication.
      @expiration = Aws.shared_config.get('expiration', profile: @profile) rescue nil
      @mutex = Mutex.new
      if near_expiration?
        refresh!
      else
        @credentials = Aws.shared_config.credentials(profile: @profile) rescue nil
      end
    end

    private

    # Use cached Application Default Credentials if available,
    # otherwise fallback to creating new Google credentials through browser login.
    def google_client
      @google_client ||= (Google::Auth.get_application_default rescue nil) || google_oauth
    end

    # Create an OAuth2 Client using Google's default browser-based OAuth InstalledAppFlow.
    # Store cached credentials to the standard Google Application Default Credentials location.
    # Ref: http://goo.gl/IUuyuX
    def google_oauth
      return nil if @oauth_attempted
      @oauth_attempted = true
      require 'google/api_client/auth/installed_app'
      flow = Google::APIClient::InstalledAppFlow.new(
        client_id: @google_id.id,
        client_secret: @google_id.secret,
        scope: %w(email profile)
      )
      path = "#{ENV['HOME']}/.config/#{Google::Auth::CredentialsLoader::WELL_KNOWN_PATH}"
      FileUtils.mkdir_p(File.dirname(path))
      flow.authorize(GoogleStorage.new(Google::APIClient::FileStore.new(path)))
    end

    def refresh
      assume_role = begin
        client = google_client
        return unless client

        begin
          tries ||= 2
          id_token = client.id_token
          # Decode the JWT id_token to use the Google email as the AWS role session name.
          token_params = JWT.decode(id_token, nil, false).first
        rescue JWT::DecodeError, JWT::ExpiredSignature
          # Refresh and retry once if token is expired or invalid.
          client.refresh!
          (tries -= 1).zero? ? raise : retry
        end

        @client.assume_role_with_web_identity(
          @assume_role_params.merge(
            web_identity_token: id_token,
            role_session_name: token_params['email']
          )
        )
      rescue Aws::STS::Errors::AccessDenied => e
        if (@google_client = google_oauth)
          retry
        end
        raise e, "\nYour Google ID does not have access to the requested AWS Role. Ask your administrator to provide access.
Role: #{@assume_role_params[:role_arn]}
Email: #{token_params['email']}
Google ID: #{token_params['sub']}"
      end
      c = assume_role.credentials
      @credentials = Aws::Credentials.new(
        c.access_key_id,
        c.secret_access_key,
        c.session_token
      )
      @expiration = c.expiration.to_i
      write_credentials
    end

    # Use `aws configure set` to write credentials and expiration to AWS credentials file.
    # AWS CLI is needed because writing AWS credentials is not supported by the AWS Ruby SDK.
    def write_credentials
      %w(
        access_key_id
        secret_access_key
        session_token
      ).map {|x| ["aws_#{x}", @credentials.send(x)]}.
        to_h.
        merge(expiration: @expiration).each do |key, value|
        system("aws configure set #{key} #{value} --profile #{@profile}")
      end
    end
  end

  # Patch Aws::SharedConfig to allow fetching arbitrary keys from the shared config.
  module SharedConfigGetKey
    def get(key, opts = {})
      profile = opts.delete(:profile) || @profile_name
      if @parsed_config && (prof_config = @parsed_config[profile])
        prof_config[key]
      else
        nil
      end
    end
  end
  Aws::SharedConfig.prepend SharedConfigGetKey

  # Extend Google::APIClient::Storage to write {type: 'authorized_user'} to credentials,
  # as required by Google's default credentials loader.
  class GoogleStorage < Google::APIClient::Storage
    def credentials_hash
      super.merge(type: 'authorized_user')
    end
  end
end
