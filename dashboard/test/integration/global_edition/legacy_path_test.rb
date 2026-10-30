# frozen_string_literal: true

require 'test_helper'

class GlobalEditionLegacyPathTest < ActionDispatch::IntegrationTest
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
end
