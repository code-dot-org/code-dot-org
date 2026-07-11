# frozen_string_literal: true

require 'test_helper'

class FrontendStudioControllerTest < ActionController::TestCase
  CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=31536000, stale-if-error=31536000'

  describe 'GET #index' do
    subject(:get_index) {get :index}

    it 'renders a public shell without session-specific metadata' do
      _get_index

      _(response.status).must_equal 200
      _(response.headers['Cache-Control']).must_equal CACHE_CONTROL
      _(response.headers['Set-Cookie'].to_s).must_be_empty
      _(session[:statsig_stable_id]).must_be_nil
      _(css_select('meta[name="csrf-token"]')).must_be_empty
    end

    it 'renders the same shell for different request cookies' do
      @request.headers['Cookie'] = 'session=first'
      _get_index
      first_body = response.body

      @request.headers['Cookie'] = 'session=second'
      _get_index

      _(response.body).must_equal first_body
    end
  end
end
