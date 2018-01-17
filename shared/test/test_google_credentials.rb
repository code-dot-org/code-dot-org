require 'minitest/autorun'
require_relative 'test_helper'
require 'mocha/mini_test'
require 'cdo/aws/google_credentials'
require 'active_support/core_ext/numeric/time'
require 'timecop'
require 'webmock/minitest'

describe Cdo::GoogleCredentials do
  before do
    # Load fixtures instead of actual shared AWS config on filesystem.
    credentials = File.expand_path(File.join(__dir__, 'fixtures', 'aws_credentials'))
    config = File.expand_path(File.join(__dir__, 'fixtures', 'aws_config'))
    Aws.shared_config.fresh(
      config_enabled: true,
      credentials_path: credentials,
      config_path: config
    )
    # Disable instance metadata credentials.
    stub_request(:get, /.*169\.254\.169\.254.*/)
    # Disable environment credentials.
    ENV.stubs(:[]).returns(nil)
  end

  describe 'not configured' do
    before do
      Cdo::GoogleCredentials.stubs(:config).returns(nil)
    end

    it 'does nothing' do
      Cdo::GoogleCredentials.expects(:new).never
      Aws::STS::Client.new
    end
  end

  describe 'configured' do
    let :config do
      {
        role_arn: 'aws_role',
        google_client_id: 'client_id',
        google_client_secret: 'client_secret',
        profile: 'cdo',
        client: Aws::STS::Client.new(stub_responses: true)
      }
    end

    let :credentials do
      {
        access_key_id: 'x',
        secret_access_key: 'y',
        session_token: 'z',
        expiration: 1.hour.from_now
      }
    end

    let :oauth do
      mock.tap do |m|
        m.stubs(:id_token).returns(
          JWT.encode({email: 'email'}, '')
        )
      end
    end

    let(:system) {@system}

    before do
      Cdo::GoogleCredentials.stubs(:config).returns(config)
      config[:client].stub_responses(
        :assume_role_with_web_identity,
        credentials: credentials
      )
      @system = Object.any_instance.stubs(:system).with {|x| x.match /aws configure set /}
      @oauth_default = Google::Auth.stubs(:get_application_default).returns(oauth)
    end

    it 'creates credentials from a Google auth token' do
      @oauth_default.once
      system.times(4)

      c = Aws::STS::Client.new.config.credentials
      c.credentials.access_key_id.must_equal credentials[:access_key_id]
      c.credentials.secret_access_key.must_equal credentials[:secret_access_key]
      c.credentials.session_token.must_equal credentials[:session_token]
    end

    it 'refreshes expired Google auth token credentials' do
      m = mock
      m.stubs(:refresh!)
      m.stubs(:id_token).
        returns(JWT.encode({email: 'email', exp: Time.now.to_i - 1}, '')).
        then.returns(JWT.encode({email: 'email'}, '')).twice
      Google::Auth.stubs(:get_application_default).returns(m)

      system.times(4)

      c = Aws::STS::Client.new.config.credentials
      c.credentials.access_key_id.must_equal credentials[:access_key_id]
      c.credentials.secret_access_key.must_equal credentials[:secret_access_key]
      c.credentials.session_token.must_equal credentials[:session_token]
    end

    it 'refreshes expired credentials' do
      config[:client].stub_responses(
        :assume_role_with_web_identity,
        [
          {credentials: credentials.dup.tap {|c| c[:expiration] = 1.hour.from_now}},
          {credentials: credentials.dup.tap {|c| c[:expiration] = 2.hours.from_now}}
        ]
      )
      service = Aws::STS::Client.new
      expiration = service.config.credentials.expiration
      expiration.must_equal(service.config.credentials.expiration)
      Timecop.travel (1.5).hours.from_now do
        expiration.wont_equal(service.config.credentials.expiration)
      end
    end

    it 'refreshes saved expired credentials' do
      config[:profile] = 'cdo-expired'
      @oauth_default.once
      system.times(4)
      Aws::STS::Client.new.config.credentials
    end

    it 'reuses saved credentials without refreshing' do
      config[:profile] = 'cdo-saved'
      Cdo::GoogleCredentials.any_instance.expects(:refresh).never
      Aws::STS::Client.new.config.credentials
    end

    describe 'invalid Google auth' do
      before do
        config[:client].stub_responses(
          :assume_role_with_web_identity,
          [
            Aws::STS::Errors::AccessDenied.new(nil, nil),
            {credentials: credentials}
          ]
        )
      end

      it 'retries Google auth when invalid credentials are provided' do
        system.times(4)
        @oauth_default.once
        Cdo::GoogleCredentials.any_instance.expects(:google_oauth).returns(oauth)
        Aws::STS::Client.new.config.credentials
      end

      it 'raises error on invalid Google auth' do
        Google::Auth.expects(:get_application_default).returns(nil)
        Cdo::GoogleCredentials.any_instance.expects(:google_oauth).times(2).returns(oauth, nil)
        err = assert_raises(Aws::STS::Errors::AccessDenied) do
          Aws::STS::Client.new.config.credentials
        end
        err.message.must_match /Your Google ID does not have access to the requested AWS Role./
      end
    end
  end
end
