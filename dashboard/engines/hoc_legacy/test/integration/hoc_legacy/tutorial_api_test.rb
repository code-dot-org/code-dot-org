# frozen_string_literal: true

require 'test_helper'

class HocLegacy::TutorialApiTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  let(:tutorial_code) {'poem_art'}
  let(:encoded_tutorial_code) {CGI.escape(Base64.urlsafe_encode64(tutorial_code))}
  let(:student_name) {'Student Name'}

  setup do
    VCR.configure do |config|
      config.cassette_library_dir = dashboard_engines_dir('hoc_legacy', 'test', 'fixtures', 'vcr_cassettes')
    end
  end

  around do |test|
    PEGASUS_DB.transaction(rollback: :always) {test.call}
  end

  before do
    allow(DCDO).to receive(:get).and_call_original
    allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', false).and_return(true)
  end

  it 'has expected basic flow from begin to finish' do
    VCR.use_cassette('hoc_legacy/tutorial_api/basic_flow') do
      get "/api/hour/begin/#{tutorial_code}"
      must_redirect_to 'https://code.org/poetry'
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).wont_be_nil
      _(PEGASUS_DB[:hoc_activity].where(session: cookies[HocLegacy::HOC_COOKIE_KEY]).count).must_equal 1

      get "/api/hour/begin_#{tutorial_code}.png"
      must_respond_with :success
      _(response.media_type).must_equal 'image/png'
      _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]

      get "/api/hour/finish_#{tutorial_code}.png"
      must_respond_with :success
      _(response.media_type).must_equal 'image/png'
      _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]

      get "/api/hour/finish/#{tutorial_code}"
      must_redirect_to "https://test-studio.code.org/congrats?i=#{cookies[HocLegacy::HOC_COOKIE_KEY]}&s=#{encoded_tutorial_code}"

      post '/api/hour/certificate', params: {session_s: cookies[HocLegacy::HOC_COOKIE_KEY], name_s: student_name}
      must_respond_with :success
      _(json_response).must_equal(
        {
          'session'          => cookies[HocLegacy::HOC_COOKIE_KEY],
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
    end
  end

  it 'has expected basic flow from begin to finish_current' do
    VCR.use_cassette('hoc_legacy/tutorial_api/basic_flow_with_finish_current') do
      get "/api/hour/begin/#{tutorial_code}"
      must_redirect_to 'https://code.org/poetry'
      _(cookies[HocLegacy::HOC_COOKIE_KEY]).wont_be_nil

      get "/api/hour/begin_#{tutorial_code}.png"
      must_respond_with :success

      get "/api/hour/finish_#{tutorial_code}.png"
      must_respond_with :success

      get '/api/hour/finish'
      must_redirect_to "https://test-studio.code.org/congrats?i=#{cookies[HocLegacy::HOC_COOKIE_KEY]}"

      post '/api/hour/certificate', params: {session_s: cookies[HocLegacy::HOC_COOKIE_KEY], name_s: student_name}
      must_respond_with :success
      _(json_response).must_equal(
        {
          'session'          => cookies[HocLegacy::HOC_COOKIE_KEY],
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
    end
  end

  context 'when DCDO hoc_apis_in_dashboard is false' do
    before do
      allow(DCDO).to receive(:get).with('hoc_apis_in_dashboard', false).and_return(false)
    end

    it 'has expected basic flow from begin to finish without activity tracking' do
      VCR.use_cassette('hoc_legacy/tutorial_api/basic_flow_without_activity_tracking') do
        get "/api/hour/begin/#{tutorial_code}"
        must_redirect_to 'https://code.org/poetry'

        get "/api/hour/begin_#{tutorial_code}.png"
        must_respond_with :success
        _(response.media_type).must_equal 'image/png'
        _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]

        get "/api/hour/finish_#{tutorial_code}.png"
        must_respond_with :success
        _(response.media_type).must_equal 'image/png'
        _(response.headers["Content-Disposition"]).must_equal %q[inline; filename="1x1.png"; filename*=UTF-8''1x1.png]

        get "/api/hour/finish/#{tutorial_code}"
        must_redirect_to "https://test-studio.code.org/congrats?s=#{encoded_tutorial_code}"

        post '/api/hour/certificate', params: {session_s: cookies[HocLegacy::HOC_COOKIE_KEY], name_s: student_name}
        must_respond_with :success
        _(json_response).must_equal(
          {
            'session'          => nil,
            'tutorial'         => nil,
            'company'          => nil,
            'started'          => false,
            'pixel_started'    => false,
            'pixel_finished'   => false,
            'finished'         => false,
            'name'             => nil,
            'certificate_sent' => false,
          }
        )
      end
    end
  end
end
