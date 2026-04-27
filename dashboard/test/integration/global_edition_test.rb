# frozen_string_literal: true

require 'omniauth'

require 'test_helper'
require 'cdo/global_edition'

class GlobalEditionTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  let(:ge_region) {'fa'}
  let(:document) {Nokogiri::HTML(response.body)}
  let(:ge_region_script_data) {document.at('script[data-ge-region]').try(:[], 'data-ge-region')}
  let(:page_lang) {document.at('html[lang]').try(:[], 'lang')}

  before do
    allow(DCDO).to receive(:get).and_call_original
    allow(DCDO).to receive(:get).with('global_edition_enabled', anything).and_return(true)
    allow(Cdo::GlobalEdition).to receive(:target_host?).with('test-studio.code.org').and_return(true)
    allow(Cdo::GlobalEdition).to receive(:target_host?).with('test.code.org').and_return(true)
    allow(Metrics::Events).to receive(:log_event)
  end

  describe 'routing' do
    let(:international_page_path) {'/users/sign_in'}
    let(:ge_region_locale) {'fa-IR'}
    let(:regional_page_path) {File.join('/', ge_region, international_page_path)}

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
          expect(Metrics::Events).to receive(:log_event).with(
            event_name: 'Global Edition Region Changed',
            user: nil,
            session: anything,
            metadata: {
              old_region: nil,
              old_locale: ge_region_locale,
              new_region: ge_region,
              new_locale: ge_region_locale,
            }
          ).once

          get_international_page

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

      context 'when :language_ cookie is set to locale supported by region' do
        let(:params) {{foo: 'bar'}}

        before do
          cookies[:language_] = ge_region_locale
        end

        it 'redirects to regional page with params' do
          expect(Metrics::Events).to receive(:log_event).with(
            event_name: 'Global Edition Region Changed',
            user: nil,
            session: anything,
            metadata: {
              old_region: nil,
              old_locale: ge_region_locale,
              new_region: ge_region,
              new_locale: ge_region_locale,
            }
          ).once

          get_international_page

          must_respond_with 302
          must_redirect_to "#{regional_page_path}?#{params.to_query}"

          follow_redirect!

          must_respond_with :success
          _(path).must_equal regional_page_path
          _(request.params[:foo]).must_equal params[:foo]
        end
      end
    end

    describe 'regional (global) page' do
      subject(:get_regional_page) {get regional_page_path, params: params}

      let(:params) {{}}

      it 'is accessible' do
        expect(Metrics::Events).to receive(:log_event).with(
          event_name: 'Global Edition Region Changed',
          user: nil,
          session: anything,
          metadata: {
            old_region: nil,
            old_locale: I18n.default_locale.to_s,
            new_region: ge_region,
            new_locale: ge_region_locale,
          }
        ).once

        get_regional_page

        must_respond_with 200
        _(path).must_equal regional_page_path
      end

      it 'sets script ge-region data attribute' do
        get_regional_page
        _(ge_region_script_data).must_equal ge_region
      end

      it 'sets request :ge_region cookie' do
        get_regional_page
        _(request.cookies['ge_region']).must_equal ge_region
      end

      it 'sets request :language_ cookie to regional locale' do
        get_regional_page
        _(request.cookies['language_']).must_equal ge_region_locale
      end

      it 'routing helpers generates region version of urls' do
        get_regional_page
        new_user_button = must_select("form#new_user[method='post']").first
        _(new_user_button['action']).must_equal regional_page_path
      end

      context 'for signed-in user' do
        let(:international_page_path) {'/home'}
        let(:user) {create(:user)}

        before do
          sign_in user
        end

        it 'is accessible' do
          expect(Metrics::Events).to receive(:log_event).with(
            event_name: 'Global Edition Region Changed',
            user:,
            session: anything,
            metadata: {
              old_region: nil,
              old_locale: I18n.default_locale.to_s,
              new_region: ge_region,
              new_locale: ge_region_locale,
            }
          ).once

          get_regional_page

          must_respond_with 200
          _(path).must_equal regional_page_path
        end
      end

      context 'when region is already set' do
        before do
          cookies[:ge_region] = ge_region
        end

        it 'is accessible' do
          expect(Metrics::Events).not_to receive(:log_event).with(
            event_name: 'Global Edition Region Changed',
            user: anything,
            session: anything,
            metadata: anything,
          )

          get_regional_page

          must_respond_with 200
          _(path).must_equal regional_page_path
        end
      end

      context 'on locale change via params' do
        let(:params) {{set_locale: new_locale}}
        let(:extra_params) {{foo: 'bar'}}

        let(:new_locale) {'en-US'}

        before do
          params.merge!(extra_params)
        end

        it 'redirects to international page with extra params and selected locale' do
          expect(Metrics::Events).to receive(:log_event).with(
            event_name: 'Global Edition Region Changed',
            user: nil,
            session: anything,
            metadata: {
              old_region: ge_region,
              old_locale: new_locale,
              new_region: nil,
              new_locale:,
            }
          ).once

          get_regional_page

          must_respond_with 302
          must_redirect_to "#{regional_page_path}?#{extra_params.to_query}"

          follow_redirect!

          must_respond_with 302
          must_redirect_to "#{international_page_path}?#{extra_params.to_query}"

          follow_redirect!

          must_respond_with 200
          _(request.fullpath).must_equal "#{international_page_path}?#{extra_params.to_query}"

          _(request.locale).must_equal new_locale
          _(cookies[:language_]).must_equal new_locale
          _(page_lang).must_equal new_locale
        end
      end

      context 'when :language_ cookie is set to locale not supported by region' do
        let(:new_locale) {'en-US'}

        before do
          cookies[:language_] = new_locale
        end

        it 'redirects back to international page' do
          expect(Metrics::Events).not_to receive(:log_event).with(
            event_name: 'Global Edition Region Changed',
            user: anything,
            session: anything,
            metadata: anything,
          )

          get_regional_page

          must_respond_with 302
          must_redirect_to international_page_path

          follow_redirect!

          must_respond_with :success
          _(path).must_equal international_page_path
        end
      end

      context 'when ge_region is invalid' do
        let(:ge_region) {'_'}

        it 'is not accessible' do
          error = _ {get_regional_page}.must_raise ActionController::RoutingError
          _(error.message).must_equal "No route matches [GET] #{regional_page_path.inspect}"
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
        post "/fa/users/auth/#{provider}"
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

  describe 'legacy "/global/fa/*" path' do
    subject(:get_legacy_farsi_page) {get legacy_farsi_page_path, params: params}

    let(:legacy_farsi_page_path) {'/global/fa/users/sign_in'}
    let(:valid_farsi_page_path) {'/fa/users/sign_in'}
    let(:params) {{foo: 'bar'}}

    it 'fallbacks to valid regional path' do
      get_legacy_farsi_page

      must_respond_with 302
      must_redirect_to "#{valid_farsi_page_path}?#{params.to_query}"

      follow_redirect!

      must_respond_with 200
      _(request.fullpath).must_equal "#{valid_farsi_page_path}?#{params.to_query}"
    end
  end

  describe 'region with multiple locales' do
    let(:locale) {'en-IN'}
    let(:ge_region) {'in'}
    let(:url_locale) {'en'}

    let(:international_page_path) {'/users/sign_in'}
    let(:regional_page_path) {File.join('/', ge_region, url_locale, international_page_path)}

    let(:extra_param_key) {:foo}
    let(:extra_param_val) {'bar'}

    it 'is accessible via region change param' do
      get international_page_path, params: {ge_region:, extra_param_key => extra_param_val}

      must_respond_with 302
      must_redirect_to "#{regional_page_path}?#{extra_param_key}=#{extra_param_val}"

      follow_redirect!

      must_respond_with 200
      _(path).must_equal regional_page_path
      _(request.params[extra_param_key]).must_equal extra_param_val
      _(ge_region_script_data).must_equal ge_region
      _(page_lang).must_equal locale

      expect(Metrics::Events).to have_received(:log_event).with(
        event_name: 'Global Edition Region Changed',
        user: nil,
        session: anything,
        metadata: {
          old_region: nil,
          old_locale: I18n.default_locale.to_s,
          new_region: ge_region,
          new_locale: locale,
        }
      ).once
    end

    it 'is accessible after locale change to main region locale' do
      get international_page_path, params: {set_locale: locale, extra_param_key => extra_param_val}

      must_respond_with 302
      must_redirect_to "#{international_page_path}?#{extra_param_key}=#{extra_param_val}"

      follow_redirect!

      must_respond_with 302
      must_redirect_to "#{regional_page_path}?#{extra_param_key}=#{extra_param_val}"

      follow_redirect!

      must_respond_with 200
      _(path).must_equal regional_page_path
      _(request.params[extra_param_key]).must_equal extra_param_val
      _(ge_region_script_data).must_equal ge_region
      _(page_lang).must_equal locale

      expect(Metrics::Events).to have_received(:log_event).with(
        event_name: 'Global Edition Region Changed',
        user: nil,
        session: anything,
        metadata: {
          old_region: nil,
          old_locale: locale,
          new_region: ge_region,
          new_locale: locale,
        }
      ).once
    end

    context 'when locale is secondary region locale' do
      let(:locale) {'hi-IN'}
      let(:url_locale) {'hi'}

      it 'is accessible after locale change' do
        get international_page_path, params: {set_locale: locale, extra_param_key => extra_param_val}

        must_respond_with 302
        must_redirect_to "#{international_page_path}?#{extra_param_key}=#{extra_param_val}"

        follow_redirect!

        must_respond_with 302
        must_redirect_to "#{regional_page_path}?#{extra_param_key}=#{extra_param_val}"

        follow_redirect!

        must_respond_with 200
        _(path).must_equal regional_page_path
        _(request.params[extra_param_key]).must_equal extra_param_val
        _(ge_region_script_data).must_equal ge_region
        _(page_lang).must_equal locale

        expect(Metrics::Events).to have_received(:log_event).with(
          event_name: 'Global Edition Region Changed',
          user: nil,
          session: anything,
          metadata: {
            old_region: nil,
            old_locale: locale,
            new_region: ge_region,
            new_locale: locale,
          }
        ).once
      end
    end
  end
end
