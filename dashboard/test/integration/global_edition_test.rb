# frozen_string_literal: true

require 'test_helper'

class GlobalEditionTest < ActionDispatch::IntegrationTest
  let(:ge_region) {'la'}
  let(:ge_region_locale) {'es-LA'}

  let(:default_region_page_path) {'/users/sign_in'}
  let(:regional_page_path) {File.join('/', ge_region, default_region_page_path)}
  let(:extra_params) {{foo: 'bar'}}

  let(:document) {Nokogiri::HTML(response.body)}
  let(:page_ge_region) {document.at('html[data-ge-region]').try(:[], 'data-ge-region')}
  let(:page_lang) {document.at('html[lang]').try(:[], 'lang')}

  describe 'regular page' do
    subject(:get_regular_page) {get default_region_page_path, params: params.merge(extra_params)}

    let(:params) {{}}

    it 'is accessible without region prefix' do
      get_regular_page

      must_respond_with :success
      _(path).must_equal default_region_page_path

      _(page_ge_region).must_equal Cdo::GlobalEdition::DEFAULT_REGION
      _(page_lang).must_equal Cdo::GlobalEdition::DEFAULT_LOCALE

      _(cookies['ge_region']).must_equal Cdo::GlobalEdition::DEFAULT_REGION
      _(cookies['language_']).must_equal Cdo::GlobalEdition::DEFAULT_LOCALE
    end

    context 'when language is secondary default region locale' do
      let(:ge_region_secondary_locale) {'es-MX'}

      before do
        cookies[:language_] = ge_region_secondary_locale
      end

      it 'redirects to default region page with region/language prefix' do
        get_regular_page

        must_respond_with 302
        must_redirect_to "#{File.join('/', Cdo::GlobalEdition::DEFAULT_REGION, 'es', default_region_page_path)}?#{extra_params.to_query}"

        follow_redirect!
        must_respond_with :success

        _(page_ge_region).must_equal Cdo::GlobalEdition::DEFAULT_REGION
        _(page_lang).must_equal ge_region_secondary_locale

        _(cookies['ge_region']).must_equal Cdo::GlobalEdition::DEFAULT_REGION
        _(cookies['language_']).must_equal ge_region_secondary_locale
      end
    end

    context 'when region locked locale is set via params' do
      let(:params) {{set_locale: ge_region_locale}}

      before do
        params.merge!(extra_params)
      end

      it 'redirects to regional page with extra params' do
        get_regular_page

        must_respond_with 302
        must_redirect_to "#{default_region_page_path}?#{extra_params.to_query}"

        follow_redirect!

        must_respond_with 302
        must_redirect_to "#{regional_page_path}?#{extra_params.to_query}"

        follow_redirect!

        must_respond_with :success
        _(path).must_equal regional_page_path
        _(request.params[:foo]).must_equal extra_params[:foo]
      end
    end

    context 'when :language_ cookie is set to locale supported by region' do
      before do
        cookies[:language_] = ge_region_locale
      end

      it 'redirects to regional page with params' do
        get_regular_page

        must_respond_with 302
        must_redirect_to "#{regional_page_path}?#{extra_params.to_query}"

        follow_redirect!
        must_respond_with :success

        _(request.params[:foo]).must_equal extra_params[:foo]
        _(page_ge_region).must_equal ge_region
        _(page_lang).must_equal ge_region_locale

        _(cookies['ge_region']).must_equal ge_region
        _(cookies['language_']).must_equal ge_region_locale
      end
    end

    context 'when XHR request has :language_ cookie set to locale supported by region' do
      before do
        cookies[:language_] = ge_region_locale
      end

      it 'does not redirect to regional page' do
        get default_region_page_path, params: params.merge(extra_params), headers: {'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest'}

        must_respond_with :success
        _(path).must_equal default_region_page_path
        _(request.params[:foo]).must_equal extra_params[:foo]
        _(page_ge_region).must_equal ge_region
      end
    end
  end

  describe 'regional page' do
    subject(:get_regional_page) {get regional_page_path, params: params}

    let(:params) {{}}

    it 'is accessible' do
      get_regional_page

      must_respond_with :success
      _(path).must_equal regional_page_path

      _(page_ge_region).must_equal ge_region
      _(page_lang).must_equal ge_region_locale

      _(cookies['ge_region']).must_equal ge_region
      _(cookies['language_']).must_equal ge_region_locale
    end

    it 'routing helpers generates region version of urls' do
      get_regional_page
      # The sign-in form is React-rendered now, so the region-versioned action
      # (session_path) is handed to the mount point as a data attribute rather
      # than a server-rendered form[action].
      sign_in_mount = must_select('#sign-in-page-layout').first
      _(sign_in_mount['data-sign-in-path']).must_equal regional_page_path
    end

    context 'for signed-in user' do
      let(:default_region_page_path) {'/home'}
      let(:user) {create(:user)}

      before do
        sign_in user
      end

      it 'is accessible' do
        get_regional_page

        must_respond_with :success
        _(path).must_equal regional_page_path
      end
    end

    context 'when region is already set' do
      before do
        cookies[:ge_region] = ge_region
      end

      it 'is accessible' do
        get_regional_page

        must_respond_with :success
        _(path).must_equal regional_page_path
      end
    end

    context 'on locale change via params' do
      let(:params) {{set_locale: new_locale}}
      let(:extra_params) {{foo: 'bar'}}

      let(:new_locale) {Cdo::GlobalEdition::DEFAULT_LOCALE}

      before do
        cookies[:ge_region] = ge_region
        cookies[:language_] = ge_region_locale

        params.merge!(extra_params)
      end

      it 'redirects to international page with extra params and selected locale' do
        get_regional_page

        must_respond_with 302
        must_redirect_to "#{regional_page_path}?#{extra_params.to_query}"

        follow_redirect!

        must_respond_with 302
        must_redirect_to "#{default_region_page_path}?#{extra_params.to_query}"

        follow_redirect!

        must_respond_with :success
        _(request.fullpath).must_equal "#{default_region_page_path}?#{extra_params.to_query}"

        _(page_ge_region).must_equal Cdo::GlobalEdition::DEFAULT_REGION
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
        get_regional_page

        must_respond_with 302
        must_redirect_to default_region_page_path

        follow_redirect!

        must_respond_with :success
        _(path).must_equal default_region_page_path
      end
    end

    context 'with multiple locales' do
      let(:locale) {'en-IN'}
      let(:ge_region) {'in'}
      let(:url_locale) {'en'}

      let(:regional_page_path) {File.join('/', ge_region, url_locale, default_region_page_path)}

      let(:extra_param_key) {:foo}
      let(:extra_param_val) {'bar'}

      it 'is accessible directly from regional URL' do
        get regional_page_path, params: {extra_param_key => extra_param_val}

        must_respond_with :success
        _(path).must_equal regional_page_path
        _(request.params[extra_param_key]).must_equal extra_param_val
        _(page_ge_region).must_equal ge_region
        _(page_lang).must_equal locale
        _(cookies['language_']).must_equal locale
      end

      it 'is accessible after locale change to main region locale' do
        get default_region_page_path, params: {set_locale: locale, extra_param_key => extra_param_val}

        must_respond_with 302
        must_redirect_to "#{default_region_page_path}?#{extra_param_key}=#{extra_param_val}"

        follow_redirect!

        must_respond_with 302
        must_redirect_to "#{regional_page_path}?#{extra_param_key}=#{extra_param_val}"

        follow_redirect!

        must_respond_with :success
        _(path).must_equal regional_page_path
        _(request.params[extra_param_key]).must_equal extra_param_val
        _(page_ge_region).must_equal ge_region
        _(page_lang).must_equal locale
      end

      context 'when locale is secondary region locale' do
        let(:locale) {'hi-IN'}
        let(:url_locale) {'hi'}

        it 'is accessible directly from regional URL' do
          get regional_page_path, params: {extra_param_key => extra_param_val}

          must_respond_with :success
          _(path).must_equal regional_page_path
          _(request.params[extra_param_key]).must_equal extra_param_val
          _(page_ge_region).must_equal ge_region
          _(page_lang).must_equal locale
          _(cookies['language_']).must_equal locale
        end

        it 'is accessible after locale change' do
          get default_region_page_path, params: {set_locale: locale, extra_param_key => extra_param_val}

          must_respond_with 302
          must_redirect_to "#{default_region_page_path}?#{extra_param_key}=#{extra_param_val}"

          follow_redirect!

          must_respond_with 302
          must_redirect_to "#{regional_page_path}?#{extra_param_key}=#{extra_param_val}"

          follow_redirect!

          must_respond_with :success
          _(path).must_equal regional_page_path
          _(request.params[extra_param_key]).must_equal extra_param_val
          _(page_ge_region).must_equal ge_region
          _(page_lang).must_equal locale
        end
      end

      context 'when selected locale differs from URL locale' do
        let(:selected_locale) {'hi-IN'}
        let(:selected_url_locale) {'hi'}
        let(:selected_regional_page_path) {File.join('/', ge_region, selected_url_locale, default_region_page_path)}

        before do
          cookies[:language_] = selected_locale
        end

        it 'redirects to selected regional locale' do
          get regional_page_path, params: {extra_param_key => extra_param_val}

          must_respond_with 302
          must_redirect_to "#{selected_regional_page_path}?#{extra_param_key}=#{extra_param_val}"

          follow_redirect!

          must_respond_with :success
          _(path).must_equal selected_regional_page_path
          _(request.params[extra_param_key]).must_equal extra_param_val
          _(page_ge_region).must_equal ge_region
          _(page_lang).must_equal selected_locale
        end
      end
    end
  end
end
