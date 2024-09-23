# frozen_string_literal: true

require 'test_helper'

class GlobalEditionTest < ActionDispatch::IntegrationTest
  describe 'routing' do
    let(:international_page_path) {'/incubator'}
    let(:ge_region) {'fa'}
    let(:regional_page_path) {File.join('/global', ge_region, international_page_path)}

    describe 'international page' do
      it 'is accessible' do
        get international_page_path

        must_respond_with 200
        _(path).must_equal international_page_path
      end

      context 'when ge_region cookie is set' do
        before do
          cookies[:ge_region] = ge_region
        end

        it 'redirects to regional page with params' do
          params = {foo: 'bar'}
          get international_page_path, params: params

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

    describe 'regional page' do
      it 'is accessible' do
        get regional_page_path

        must_respond_with 200
        _(path).must_equal regional_page_path
      end

      it 'contains ge_region param' do
        get regional_page_path
        _(request.params[:ge_region]).must_equal ge_region
      end

      it 'routing helpers generates region version of urls' do
        _ {get regional_page_path}.must_change -> {incubator_path}, from: international_page_path, to: regional_page_path
      end

      context 'when ge_region is unavailable' do
        let(:ge_region) {'_'}

        it 'is not accessible' do
          actual_error = _ {get regional_page_path}.must_raise(ActionController::RoutingError)
          _(actual_error.message).must_equal %Q[No route matches [GET] "#{regional_page_path}"]
        end
      end
    end
  end
end
