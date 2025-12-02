# frozen_string_literal: true

require 'test_helper'

class HocLegacy::ApiFlowTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  let(:tutorial_code) {'mc'}
  let(:encoded_tutorial_code) {CGI.escape(Base64.urlsafe_encode64(tutorial_code))}
  let(:student_name) {'Student Name'}

  setup do
    VCR.configure do |config|
      config.cassette_library_dir = dashboard_engines_dir('hoc_legacy', 'test', 'fixtures', 'vcr_cassettes')
    end
  end

  around do |test|
    HocLegacy::Tutorials.clear
    PEGASUS_DB.transaction(rollback: :always) {test.call}
  ensure
    HocLegacy::Tutorials.clear
  end

  before do
    allow(CDO).to receive(:default_scheme).and_return('http:')
  end

  it 'has expected basic flow from begin to finish' do
    VCR.use_cassette('hoc_legacy/api_flow/basic_flow') do
      get "/api/hour/begin/#{tutorial_code}"
      must_redirect_to 'http://test.code.org/minecraft'

      session_id = cookies[HocLegacy::HOC_COOKIE_KEY]
      _(session_id).wont_be_nil
      _(PEGASUS_DB[:hoc_activity].where(session: session_id).count).must_equal 1

      get "/api/hour/begin_#{tutorial_code}.png"
      must_respond_with :success
      _(response.media_type).must_equal 'image/png'
      _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).must_equal session_id

      get "/api/hour/finish_#{tutorial_code}.png"
      must_respond_with :success
      _(response.media_type).must_equal 'image/png'
      _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).must_equal session_id

      get "/api/hour/finish/#{tutorial_code}"
      must_redirect_to "http://test-studio.code.org/congrats?i=#{session_id}&s=#{encoded_tutorial_code}"
      follow_redirect!
      must_respond_with :success

      patch "/api/hour/certificates/#{session_id}", params: {name: student_name}
      must_respond_with :success
      _(json_response).must_equal(
        {
          'session'          => session_id,
          'tutorial'         => tutorial_code,
          'company'          => nil,
          'started'          => true,
          'pixel_started'    => true,
          'pixel_finished'   => true,
          'finished'         => true,
          'name'             => student_name,
          'certificate_sent' => true,
        }
      )

      get "/api/hour/certificates/#{session_id}"
      must_redirect_to '/certificates/eyJuYW1lIjoiU3R1ZGVudCBOYW1lIiwiY291cnNlIjoibWMifQ=='
      follow_redirect!
      must_respond_with :success
    end
  end

  it 'has expected basic flow from begin to finish_current' do
    VCR.use_cassette('hoc_legacy/api_flow/basic_flow_with_finish_current') do
      get "/api/hour/begin/#{tutorial_code}"
      must_redirect_to 'http://test.code.org/minecraft'

      session_id = cookies[HocLegacy::HOC_COOKIE_KEY]
      _(session_id).wont_be_nil
      _(PEGASUS_DB[:hoc_activity].where(session: session_id).count).must_equal 1

      get "/api/hour/begin_#{tutorial_code}.png"
      must_respond_with :success
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).must_equal session_id

      get "/api/hour/finish_#{tutorial_code}.png"
      must_respond_with :success
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).must_equal session_id

      get '/api/hour/finish'
      must_redirect_to "http://test-studio.code.org/congrats?i=#{session_id}"
      follow_redirect!
      must_respond_with :success

      patch "/api/hour/certificates/#{session_id}", params: {name: student_name}
      must_respond_with :success
      _(json_response).must_equal(
        {
          'session'          => session_id,
          'tutorial'         => tutorial_code,
          'company'          => nil,
          'started'          => true,
          'pixel_started'    => true,
          'pixel_finished'   => true,
          'finished'         => true,
          'name'             => student_name,
          'certificate_sent' => true,
        }
      )

      get "/api/hour/certificates/#{session_id}"
      must_redirect_to '/certificates/eyJuYW1lIjoiU3R1ZGVudCBOYW1lIiwiY291cnNlIjoibWMifQ=='
      follow_redirect!
      must_respond_with :success
    end
  end

  context 'when tracking is disabled' do
    before do
      allow(CDO).to receive(:hoc_tracking_enabled).and_return(false)
    end

    it 'has expected basic flow from begin to finish' do
      get "/api/hour/begin/#{tutorial_code}"
      must_respond_with :not_found
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).must_be_nil

      get "/api/hour/begin_#{tutorial_code}.png"
      must_respond_with :success
      _(response.media_type).must_equal 'image/png'
      _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]

      get "/api/hour/finish_#{tutorial_code}.png"
      must_respond_with :success
      _(response.media_type).must_equal 'image/png'
      _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]

      get "/api/hour/finish/#{tutorial_code}"
      must_redirect_to 'http://test-studio.code.org/congrats'
      follow_redirect!
      must_respond_with :success
    end

    it 'has expected basic flow from begin to finish_current' do
      get "/api/hour/begin/#{tutorial_code}"
      must_respond_with :not_found
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).must_be_nil

      get "/api/hour/begin_#{tutorial_code}.png"
      must_respond_with :success

      get "/api/hour/finish_#{tutorial_code}.png"
      must_respond_with :success

      get '/api/hour/finish'
      must_redirect_to 'http://test-studio.code.org/congrats'
      follow_redirect!
      must_respond_with :success
    end
  end
end
