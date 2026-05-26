# frozen_string_literal: true

require 'test_helper'

class GlobalEditionRouteExclusionTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  let(:ge_region) {'fa'}
  let(:document) {Nokogiri::HTML(response.body)}
  let(:ge_region_html_data) {document.at('html[data-ge-region]').try(:[], 'data-ge-region')}

  before do
    allow(Cdo::GlobalEdition).to receive(:target_host?).with('test-studio.code.org').and_return(true)
    allow(Cdo::GlobalEdition).to receive(:target_host?).with('test.code.org').and_return(true)
    allow(Metrics::Events).to receive(:log_event)

    cookies[:ge_region] = ge_region
  end

  describe 'oauth' do
    let(:omniauth_test_mode) {OmniAuth.config.test_mode}

    before do
      # Disables OmniAuth test mode to generate real OAuth URLs.
      OmniAuth.config.test_mode = false
    end

    after do
      # Restores the initial OmniAuth test mode configuration.
      OmniAuth.config.test_mode = omniauth_test_mode
    end

    {
      AuthenticationOption::GOOGLE    => 'https://accounts.google.com/o/oauth2/auth',
      AuthenticationOption::MICROSOFT => 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      AuthenticationOption::FACEBOOK  => 'https://www.facebook.com/v2.12/dialog/oauth',
      AuthenticationOption::CLEVER    => 'https://clever.com/oauth/authorize',
    }.each do |provider, expected_oauth_url|
      it "#{provider.inspect} authentication process is not globalized" do
        post "/users/auth/#{provider}"
        must_redirect_to %r(^#{expected_oauth_url})

        oauth_uri = URI.parse(response.location)
        oauth_params = URI.decode_www_form(oauth_uri.query.to_s).to_h
        oauth_callback_url = oauth_params['redirect_uri']
        _(oauth_callback_url).must_equal "https://test-studio.code.org/users/auth/#{provider}/callback"

        # GET /users/auth/:provider/callback
        get oauth_callback_url
        must_redirect_to '/users/sign_in'
        _(ge_region_html_data).must_be_nil
      end

      it "Farsi #{provider.inspect} authentication process is not globalized" do
        post "/fa/users/auth/#{provider}"
        must_redirect_to %r(^#{expected_oauth_url})

        oauth_uri = URI.parse(response.location)
        oauth_params = URI.decode_www_form(oauth_uri.query.to_s).to_h
        oauth_callback_url = oauth_params['redirect_uri']
        _(oauth_callback_url).must_equal "https://test-studio.code.org/users/auth/#{provider}/callback"

        # GET /users/auth/:provider/callback
        get oauth_callback_url
        must_redirect_to '/users/sign_in'
        _(ge_region_html_data).must_be_nil
      end
    end
  end

  describe 'health check' do
    %w[
      /health_check
      /home/health_check
    ].each do |path|
      it "#{path.inspect} path is not globalized" do
        get path
        must_respond_with 200
        _(ge_region_html_data).must_be_nil
      end

      it "Farsi #{path.inspect} path is not globalized" do
        get ::File.join('/', ge_region, path)
        must_respond_with 200
        _(ge_region_html_data).must_be_nil
      end
    end
  end

  describe 'api' do
    %w[
      /api/v1/users/current
      /api/user_progress
      /dashboardapi/user_progress
    ].each do |path|
      it "#{path.inspect} path is not affected by regional redirection" do
        get path
        must_respond_with 200
      end

      it "Farsi #{path.inspect} path is not affected by regional redirection" do
        get ::File.join('/', ge_region, path)
        must_respond_with 200
      end
    end
  end
end
