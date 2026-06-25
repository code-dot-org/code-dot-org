# frozen_string_literal: true

require 'test_helper'

class GlobalEditionRouteExclusionTest < ActionDispatch::IntegrationTest
  let(:ge_region) {'la'}
  let(:ge_region_locale) {'es-LA'}
  let(:document) {Nokogiri::HTML(response.body)}
  let(:page_ge_region) {document.at('html[data-ge-region]').try(:[], 'data-ge-region')}

  before do
    cookies[:ge_region] = ge_region
  end

  describe 'static' do
    {
      assets: ActionController::Base.helpers.asset_path('logo-codeai-inverse.svg'),
      public: '/422.html',
      shared: '/shared/images/sad-bee-avatar.png',
    }.each do |name, path|
      it "#{name} path is not affected by regional redirection" do
        get path
        must_respond_with 200
      end

      it "#{name} path is not redirected for selected regional locale" do
        cookies[:language_] = ge_region_locale
        get path
        must_respond_with 200
      end
    end
  end

  describe 'oauth' do
    around do |test|
      original_omniauth_test_mode = OmniAuth.config.test_mode

      # Disables OmniAuth test mode to generate real OAuth URLs.
      OmniAuth.config.test_mode = false

      test.call
    ensure
      OmniAuth.config.test_mode = original_omniauth_test_mode
    end

    {
      AuthenticationOption::GOOGLE    => 'https://accounts.google.com/o/oauth2/auth',
      AuthenticationOption::MICROSOFT => 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      AuthenticationOption::FACEBOOK  => 'https://www.facebook.com/v2.12/dialog/oauth',
      AuthenticationOption::CLEVER    => 'https://clever.com/oauth/authorize',
    }.each do |provider, expected_oauth_url|
      it "#{provider} path is excluded" do
        _(Cdo::GlobalEdition.excluded_path?("#{OmniAuth.config.path_prefix}/#{provider}")).must_equal true
      end

      it "#{provider.inspect} authentication process is not globalized" do
        post "#{OmniAuth.config.path_prefix}/#{provider}"
        must_redirect_to %r(^#{expected_oauth_url})

        oauth_uri = URI.parse(response.location)
        oauth_params = URI.decode_www_form(oauth_uri.query.to_s).to_h
        oauth_callback_url = oauth_params['redirect_uri']
        _(oauth_callback_url).must_equal "https://test-studio.code.org#{OmniAuth.config.path_prefix}/#{provider}/callback"

        # GET /users/auth/:provider/callback
        get oauth_callback_url
        must_redirect_to '/users/sign_in'
        _(page_ge_region).must_be_nil
      end

      it "regional #{provider.inspect} authentication process is not globalized" do
        post "/fa#{OmniAuth.config.path_prefix}/#{provider}"
        must_redirect_to %r(^#{expected_oauth_url})

        oauth_uri = URI.parse(response.location)
        oauth_params = URI.decode_www_form(oauth_uri.query.to_s).to_h
        oauth_callback_url = oauth_params['redirect_uri']
        _(oauth_callback_url).must_equal "https://test-studio.code.org#{OmniAuth.config.path_prefix}/#{provider}/callback"

        # GET /users/auth/:provider/callback
        get oauth_callback_url
        must_redirect_to '/users/sign_in'
        _(page_ge_region).must_be_nil
      end
    end
  end

  describe 'health check' do
    [
      Dashboard::Application.routes.url_helpers.health_check_path,
      Dashboard::Application.routes.url_helpers.home_health_check_path,
    ].each do |path|
      it "#{path.inspect} path is excluded" do
        _(Cdo::GlobalEdition.excluded_path?(path)).must_equal true
      end

      it "#{path.inspect} path is not globalized" do
        get path
        must_respond_with 200
        _(page_ge_region).must_be_nil
      end

      it "regional #{path.inspect} path is not globalized" do
        get ::File.join('/', ge_region, path)
        must_respond_with 200
        _(page_ge_region).must_be_nil
      end
    end
  end

  describe 'api' do
    [
      Dashboard::Application.routes.url_helpers.api_v1_users_current_path,
      Dashboard::Application.routes.url_helpers.api_user_progress_path,
      Dashboard::Application.routes.url_helpers.dashboardapi_user_progress_path,
    ].each do |path|
      it "#{path.inspect} path is not affected by regional redirection" do
        get path
        must_respond_with 200
      end

      it "#{path.inspect} path is not redirected for selected regional locale" do
        cookies[:language_] = ge_region_locale
        get path
        must_respond_with 200
      end

      it "regional #{path.inspect} path is not affected by regional redirection" do
        get ::File.join('/', ge_region, path)
        must_respond_with 200
      end
    end
  end

  describe 'lti' do
    [Dashboard::Application.routes.url_helpers.new_lti_v1_integration_path].each do |path|
      it "#{path.inspect} path is not affected by regional redirection" do
        get path
        must_respond_with 200
        _(page_ge_region).must_be_nil
      end

      it "regional #{path.inspect} path is accessible" do
        get ::File.join('/', ge_region, path)
        must_respond_with 200
        _(page_ge_region).must_be_nil
      end
    end
  end
end
