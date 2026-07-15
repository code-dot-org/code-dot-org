# frozen_string_literal: true

require 'test_helper'
require 'base64'

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

    it 'renders the complete public social-card metadata for a certificate' do
      encoded_params = Base64.urlsafe_encode64({course: 'oceans', name: 'Student Name'}.to_json)

      get :index, params: {path: "certificates/#{encoded_params}"}

      title = css_select('meta[property="og:title"]').first['content']
      image = css_select('meta[property="og:image"]').first['content']
      _(css_select('meta[name="twitter:card"][content="summary_large_image"]').length).must_equal 1
      _(css_select('meta[property="og:type"][content="website"]').length).must_equal 1
      _(title.downcase).must_include 'certificate'
      _(css_select('meta[name="twitter:title"]').first['content']).must_equal title
      _(css_select('meta[name="twitter:image"]').first['content']).must_equal image
      _(response.body).wont_include 'Student Name'
    end

    it 'renders identical social metadata for different request cookies' do
      encoded_params = Base64.urlsafe_encode64({course: 'oceans'}.to_json)

      @request.headers['Cookie'] = 'session=first'
      get :index, params: {path: "certificates/#{encoded_params}"}
      first_metadata = css_select('meta[property^="og:"], meta[name^="twitter:"]').map(&:to_s)

      @request.headers['Cookie'] = 'session=second'
      get :index, params: {path: "certificates/#{encoded_params}"}

      _(css_select('meta[property^="og:"], meta[name^="twitter:"]').map(&:to_s)).must_equal first_metadata
    end
  end
end
