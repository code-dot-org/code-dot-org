# frozen_string_literal: true

require 'test_helper'

class GlobalEditionTest < ActionDispatch::IntegrationTest
  describe 'routing' do
    let(:international_page_path) {'/incubator'}
    let(:ge_region) {'fa'}
    let(:ge_region_locale) {'fa-IR'}
    let(:regional_page_path) {File.join('/global', ge_region, international_page_path)}

    describe 'international page' do
      subject(:get_international_page) {get international_page_path, params: params}

      let(:params) {{}}

      it 'is accessible' do
        get_international_page

        must_respond_with 200
        _(path).must_equal international_page_path
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

        context 'if ge_region is unavailable' do
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

      context 'when ge_region is unavailable' do
        let(:ge_region) {'_'}

        it 'is not accessible' do
          actual_error = _ {get_regional_page}.must_raise(ActionController::RoutingError)
          _(actual_error.message).must_equal %Q[No route matches [GET] "#{regional_page_path}"]
        end
      end
    end
  end
end
