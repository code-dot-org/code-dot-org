require 'test_helper'

class LanguageTest < ActionDispatch::IntegrationTest
  shared_examples_for 'renders in expected locale' do |expected_locale, param_locale: nil, varnish_locale: nil, cookie_locale: nil, http_locale: nil|
    context "when URL param set_locale is #{param_locale.inspect}, varnish language is #{varnish_locale.inspect}, cookie language_ is #{cookie_locale.inspect}, and browser language is #{http_locale.inspect}" do
      before do
        sign_in create(:student)
      end

      it "renders in #{expected_locale.inspect} locale" do
        request_env = {}
        request_params = {}

        request_env['HTTP_X_VARNISH_ACCEPT_LANGUAGE'] = varnish_locale         if varnish_locale
        request_env['HTTP_ACCEPT_LANGUAGE']           = "#{http_locale};q=0.9" if http_locale
        request_params[:set_locale]                   = param_locale           if param_locale
        cookies[:language_]                           = cookie_locale          if cookie_locale

        get home_url, env: request_env, params: request_params

        follow_redirect! if response.status == 302
        must_respond_with :success

        _(request.locale).must_equal expected_locale
        must_select "html[lang='#{expected_locale}']"
      end
    end
  end

  it_behaves_like 'renders in expected locale', 'en-US'
  it_behaves_like 'renders in expected locale', 'en-US', http_locale: ''
  it_behaves_like 'renders in expected locale', 'en-US', http_locale: 'invalid_locale'
  it_behaves_like 'renders in expected locale', 'en-US', http_locale: 'en'
  it_behaves_like 'renders in expected locale', 'uk-UA', http_locale: 'uk'
  it_behaves_like 'renders in expected locale', 'es-ES', http_locale: 'uk', cookie_locale: 'es'
  it_behaves_like 'renders in expected locale', 'fa-IR', http_locale: 'uk', cookie_locale: 'es', varnish_locale: 'fa'
  it_behaves_like 'renders in expected locale', 'de-DE', http_locale: 'uk', cookie_locale: 'es', varnish_locale: 'fa', param_locale: 'de-DE'
end
