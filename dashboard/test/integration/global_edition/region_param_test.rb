# frozen_string_literal: true

require 'test_helper'

class GlobalEditionRegionParamTest < ActionDispatch::IntegrationTest
  let(:ge_region) {'la'}
  let(:ge_region_locale) {'es-LA'}

  let(:regular_page_path) {'/users/sign_in'}
  let(:ge_region_page_path) {File.join('/', ge_region, regular_page_path)}
  let(:extra_params) {{foo: 'bar'}}

  it 'redirects to region page and back' do
    # Redirects to the region page
    get regular_page_path, params: extra_params.merge(ge_region:)
    must_redirect_to "#{ge_region_page_path}?#{extra_params.to_query}"
    follow_redirect!
    must_respond_with 200
    _(Nokogiri::HTML(response.body).at('html').try(:[], 'data-ge-region')).must_equal ge_region
    _(Nokogiri::HTML(response.body).at('html').try(:[], 'lang')).must_equal ge_region_locale
    _(cookies['ge_region']).must_equal ge_region
    _(cookies['language_']).must_equal ge_region_locale

    # Redirects the current page without ge_region query param
    get ge_region_page_path, params: extra_params.merge(ge_region: 'invalid_region')
    must_redirect_to "#{ge_region_page_path}?#{extra_params.to_query}"
    follow_redirect!
    must_respond_with 200
    _(Nokogiri::HTML(response.body).at('html').try(:[], 'data-ge-region')).must_equal ge_region
    _(Nokogiri::HTML(response.body).at('html').try(:[], 'lang')).must_equal ge_region_locale
    _(cookies['ge_region']).must_equal ge_region
    _(cookies['language_']).must_equal ge_region_locale

    # Resets the region and redirect to the default page
    get ge_region_page_path, params: extra_params.merge(ge_region: nil)
    must_redirect_to "#{regular_page_path}?#{extra_params.to_query}"
    follow_redirect!
    must_respond_with 200
    _(Nokogiri::HTML(response.body).at('html').try(:[], 'data-ge-region')).must_equal Cdo::GlobalEdition::DEFAULT_REGION
    _(Nokogiri::HTML(response.body).at('html').try(:[], 'lang')).must_equal Cdo::GlobalEdition::DEFAULT_LOCALE
    _(cookies['ge_region']).must_equal Cdo::GlobalEdition::DEFAULT_REGION
    _(cookies['language_']).must_equal Cdo::GlobalEdition::DEFAULT_LOCALE
  end
end
