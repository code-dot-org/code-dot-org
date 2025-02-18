# frozen_string_literal: true

require 'omniauth'

require 'cdo/global_edition'
require 'test_helper'

class GlobalEditionTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  let(:document) {Nokogiri::HTML(response.body)}
  let(:ge_region) {'fa'}

  before do
    allow(DCDO).to receive(:get).and_call_original
    allow(DCDO).to receive(:get).with('global_edition_enabled', anything).and_return(true)
    allow(Metrics::Events).to receive(:log_event)
  end

  describe 'routing' do
    let(:international_page_path) {'/incubator'}
    let(:ge_region_locale) {'fa-IR'}
    let(:regional_page_path) {File.join('/global', ge_region, international_page_path)}
    let(:ge_region_script_data) {document.at('script[data-ge-region]').try(:[], 'data-ge-region')}

    describe 'international page' do
      subject(:get_international_page) {get international_page_path, params: params}

      let(:params) {{}}

      it 'is accessible' do
        get_international_page

        must_respond_with 200
        _(path).must_equal international_page_path
      end

      context 'when region locked locale is set via params' do
        let(:params) {{set_locale: ge_region_locale}}
        let(:extra_params) {{foo: 'bar'}}

        before do
          params.merge!(extra_params)
        end

        it 'redirects to regional page with extra params' do
          get_international_page

          expect(Metrics::Events).to have_received(:log_event).with(
            event_name: 'Global Edition Region Selected',
            request: anything,
            metadata: {
              region: ge_region,
              locale: ge_region_locale,
            }
          ).once

          must_respond_with 302
          must_redirect_to "#{international_page_path}?#{extra_params.to_query}"

          follow_redirect!

          must_respond_with 302
          must_redirect_to "#{regional_page_path}?#{extra_params.to_query}"

          follow_redirect!

          must_respond_with 200
          _(path).must_equal regional_page_path
          _(request.params[:foo]).must_equal extra_params[:foo]
        end
      end

      context 'when ge_region param is set' do
        let(:params) {{ge_region: ge_region}}
        let(:extra_params) {{foo: 'bar'}}

        before do
          params.merge!(extra_params)
        end

        it 'redirects to regional page with extra params' do
          get_international_page

          must_respond_with 302
          must_redirect_to "#{regional_page_path}?#{extra_params.to_query}"

          follow_redirect!

          must_respond_with 200
          _(path).must_equal regional_page_path
          _(request.params[:foo]).must_equal extra_params[:foo]
        end
      end

      context 'when ge_region cookie is set' do
        let(:params) {{foo: 'bar'}}

        before do
          cookies[:ge_region] = ge_region
        end

        it 'redirects to regional page with params' do
          get_international_page

          must_respond_with 302
          must_redirect_to "#{regional_page_path}?#{params.to_query}"

          follow_redirect!

          must_respond_with 200
          _(path).must_equal regional_page_path
          _(request.params[:foo]).must_equal params[:foo]
        end

        it 'does not redirect from not application routes' do
          get '/500.html'
          must_respond_with :success
        end

        context 'if ge_region is invalid' do
          let(:ge_region) {'_'}

          it 'stays on international page' do
            get international_page_path

            must_respond_with 200
            _(path).must_equal international_page_path
          end
        end
      end
    end

    describe 'regional (global) page' do
      subject(:get_regional_page) {get regional_page_path, params: params}

      let(:params) {{}}

      it 'is accessible' do
        get_regional_page

        must_respond_with 200
        _(path).must_equal regional_page_path
      end

      it 'script data is set' do
        get_regional_page
        _(ge_region_script_data).must_equal ge_region
      end

      it 'request cookies contains ge_region' do
        get_regional_page
        _(request.cookies['ge_region']).must_equal ge_region
      end

      it 'request language cookie is set to regional language' do
        get_regional_page
        _(request.cookies['language_']).must_equal ge_region_locale
      end

      it 'global ge_region cookie is changed to region from the link' do
        init_ge_region = 'en'
        cookies['ge_region'] = init_ge_region
        _ {get_regional_page}.must_change -> {cookies['ge_region']}, from: init_ge_region, to: ge_region
      end

      it 'global language cookie is changed to regional language' do
        selected_locale = 'uk-UA'
        cookies['language_'] = selected_locale
        _ {get_regional_page}.must_change -> {cookies['language_']}, from: selected_locale, to: ge_region_locale
      end

      it 'routing helpers generates region version of urls' do
        _ {get_regional_page}.must_change -> {incubator_path}, from: international_page_path, to: regional_page_path
      end

      context 'on locale change via params' do
        let(:params) {{set_locale: locale}}
        let(:extra_params) {{foo: 'bar'}}

        let(:locale) {'en-US'}

        before do
          params.merge!(extra_params)
        end

        it 'changes region page language' do
          get_regional_page

          expect(Metrics::Events).not_to have_received(:log_event).with(
            event_name: 'Global Edition Region Selected',
            request: anything,
            metadata: anything,
          )

          must_respond_with 302
          must_redirect_to "#{regional_page_path}?#{extra_params.to_query}"

          follow_redirect!

          must_respond_with 200
          _(request.fullpath).must_equal "#{regional_page_path}?#{extra_params.to_query}"
        end

        context 'when locale is not available in region' do
          let(:locale) {'uk-UA'}

          it 'redirects to international page' do
            get_regional_page

            expect(Metrics::Events).to have_received(:log_event).with(
              event_name: 'Global Edition Region Selected',
              request: anything,
              metadata: {
                region: nil,
                locale: locale,
              }
            ).once

            must_respond_with 302
            must_redirect_to "#{regional_page_path}?#{extra_params.to_query}&ge_region"
          end
        end
      end

      context 'when ge_region is invalid' do
        let(:ge_region) {'_'}

        it 'is not accessible' do
          get_regional_page
          must_respond_with 500
        end
      end
    end
  end

  describe 'oauth' do
    let(:omniauth_test_mode) {OmniAuth.config.test_mode}

    before do
      cookies[:ge_region] = ge_region

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
      it "#{provider} authentication process is not affected by regional redirection" do
        post "/global/fa/users/auth/#{provider}"
        must_redirect_to %r(^#{expected_oauth_url})

        oauth_uri = URI.parse(response.location)
        oauth_params = URI.decode_www_form(oauth_uri.query.to_s).to_h
        oauth_callback_url = oauth_params['redirect_uri']
        _(oauth_callback_url).must_equal "https://test-studio.code.org/users/auth/#{provider}/callback"

        # GET /users/auth/:provider/callback
        get oauth_callback_url
        must_redirect_to '/users/sign_in'
      end
    end
  end
end
