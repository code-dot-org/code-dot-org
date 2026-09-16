require 'test_helper'

class LanguageTest < ActionDispatch::IntegrationTest
  shared_examples_for 'renders in expected locale' do |expected_locale, param_locale: nil, cookie_locale: nil, http_locale: nil|
    context "when URL param set_locale is #{param_locale.inspect}, cookie language_ is #{cookie_locale.inspect}, and browser language is #{http_locale.inspect}" do
      it "renders in #{expected_locale.inspect} locale" do
        request_env = {}
        request_params = {}

        request_env['HTTP_ACCEPT_LANGUAGE']           = "#{http_locale};q=0.9" if http_locale
        request_params[:set_locale]                   = param_locale           if param_locale
        cookies[:language_]                           = cookie_locale          if cookie_locale

        get new_user_session_path, env: request_env, params: request_params

        follow_redirect! while response.status == 302

        must_respond_with :success
        must_select "html[lang='#{expected_locale}']"
      end
    end
  end

  it_behaves_like 'renders in expected locale', Cdo::I18n::DEFAULT_LOCALE
  it_behaves_like 'renders in expected locale', Cdo::I18n::DEFAULT_LOCALE, http_locale: '', cookie_locale: ''
  it_behaves_like 'renders in expected locale', Cdo::I18n::DEFAULT_LOCALE, http_locale: 'invalid_locale', cookie_locale: 'invalid_locale'
  it_behaves_like 'renders in expected locale', 'fa-IR', http_locale: 'fa'
  it_behaves_like 'renders in expected locale', 'fa-IR', http_locale: 'es', cookie_locale: 'fa'
  it_behaves_like 'renders in expected locale', 'fa-IR', http_locale: 'en', cookie_locale: 'es', param_locale: 'fa'

  context 'when I18n.locale leaks from previous request' do
    let(:leaked_locale) {'es-MX'}

    let!(:original_locale) {I18n.locale}

    before do
      I18n.locale = leaked_locale
    end

    after do
      I18n.locale = original_locale
    end

    it 'resets leaked I18n.locale to default locale' do
      _ {get new_user_session_path}.must_change -> {I18n.locale.to_s}, from: leaked_locale, to: Cdo::I18n::DEFAULT_LOCALE
    end

    it 'does not use leaked I18n.locale when no preferred-language data is present' do
      get new_user_session_path, env: {}, params: {}

      must_respond_with :success
      must_select "html[lang='#{Cdo::I18n::DEFAULT_LOCALE}']"
    end
  end

  describe 'aliases' do
    Cdo::I18n::LOCALE_ALIASES.each do |short_locale, normalized_locale|
      it "from #{short_locale.inspect} to #{normalized_locale.inspect}" do
        cookies[:language_] = short_locale

        get new_user_session_path

        follow_redirect! if response.status == 302

        must_respond_with :success
        must_select "html[lang='#{normalized_locale}']"
      end
    end
  end

  describe 'fallbacks' do
    Cdo::I18n::LOCALE_FALLBACKS.each do |locale, fallback|
      it "from #{locale.inspect} to #{fallback.inspect}" do
        i18n_string_key = :"i18n_string_key_#{locale}"

        _(I18n.fallbacks[locale].first).must_equal locale.to_sym
        _(I18n.fallbacks[locale].third).must_equal fallback.to_sym

        _ {I18n.backend.store_translations(fallback, {i18n_string_key => 'fallback_str'})}.
          must_change -> {I18n.t(i18n_string_key, locale:, default: 'default_str')}, from: 'default_str', to: 'fallback_str'

        _ {I18n.backend.store_translations(locale, {i18n_string_key => 'locale_str'})}.
          must_change -> {I18n.t(i18n_string_key, locale:)}, from: 'fallback_str', to: 'locale_str'
      end
    end
  end
end
