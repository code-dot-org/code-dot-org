require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'

ENV['RACK_ENV'] = 'test'

class HocRoutesTest < Minitest::Test
  describe 'HOC Routes' do
    before do
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @mock_session = Rack::MockSession.new(MockPegasus.new, 'studio.code.org')
      @pegasus = Rack::Test::Session.new(@mock_session)
    end

    it 'redirects to tutorial via shortcode' do
      assert_redirects_from_to '/hoc', '/hoc/reset'
    end

    it 'gets certificate info' do
      @pegasus.post '/api/hour/certificate'
      assert_equal 200, @pegasus.last_response.status
    end

    it 'starts tutorial' do
      assert_redirects_from_to '/api/hour/begin/mc', '/mc'
    end

    it 'ends tutorial' do
      assert_redirects_from_to '/api/hour/finish', '/congrats'
    end

    it 'starts given tutorial with png image' do
      assert_successful_png_get '/api/hour/begin_mc.png'
    end

    it 'ends given tutorial with png image' do
      assert_successful_png_get '/api/hour/finish_mc.png'
    end

    it 'ends given tutorial, providing script ID to congrats page' do
      assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
      assert_includes @pegasus.last_request.url, "&s=#{CGI::escape(Base64.urlsafe_encode64('mc'))}"
    end

    it 'has certificate share page' do
      cert_id = make_certificate
      assert_successful_get CDO.code_org_url("/certificates/#{cert_id}")
      assert_successful_get CDO.code_org_url("/printcertificate/#{cert_id}")

      invalid_cert_id = 'abcdefg12345'
      assert_not_found_get CDO.code_org_url("/certificates/#{invalid_cert_id}")
    end

    it 'has certificates pages for different scripts' do
      assert_successful_get CDO.code_org_url('/certificates?course=20-hour')
      assert_successful_get CDO.code_org_url('/certificates?course=mc')
      assert_successful_get CDO.code_org_url('/certificates?course=course1')
      assert_successful_get CDO.code_org_url('/certificates?course=Hour%20of%20Code')
    end

    it 'serves png, jpg, jpeg certificate images, not others' do
      cert_id = make_certificate
      assert_successful_jpeg_get CDO.code_org_url("/api/hour/certificate/#{cert_id}.jpg")
      assert_successful_jpeg_get CDO.code_org_url("/api/hour/certificate/#{cert_id}.jpeg")
      assert_successful_png_get CDO.code_org_url("/api/hour/certificate/#{cert_id}.png")

      assert_not_found_get CDO.code_org_url("/api/hour/certificate/#{cert_id}.bmp")
    end

    it 'starts and ends given tutorial, tracking company and tutorial' do
      with_test_company 'testcompany'

      before_start_row = get_session_hoc_activity_entry
      assert_nil before_start_row

      assert_redirects_from_to '/api/hour/begin_company/testcompany',
                               '/learn?company=testcompany'
      assert_redirects_from_to '/api/hour/begin/mc?company=testcompany',
                               '/mc'

      after_start_row = get_session_hoc_activity_entry
      assert_equal 'testcompany', after_start_row[:company]
      assert_equal 'mc', after_start_row[:tutorial]
      assert after_start_row[:started_at]

      assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
      assert_includes @pegasus.last_request.url, "&s=#{CGI::escape(Base64.urlsafe_encode64('mc'))}"
      assert_includes @pegasus.last_request.url, '&co=testcompany'

      after_end_row = get_session_hoc_activity_entry
      assert_equal 'testcompany', after_end_row[:company]
      assert_equal 'mc', after_end_row[:tutorial]
      assert after_end_row[:finished_at]

      remove_test_company 'testcompany'
    end

    it 'starts and ends given tutorial, tracking time' do
      before_start_row = get_session_hoc_activity_entry
      assert_nil before_start_row

      before_began_time = now_in_sequel_datetime
      assert_redirects_from_to '/api/hour/begin/mc', '/mc'
      after_began_time = now_in_sequel_datetime

      after_start_row = get_session_hoc_activity_entry
      assert_datetime_within(after_start_row[:started_at], before_began_time, after_began_time)
      assert_nil after_start_row[:finished_at]

      before_ended_time = now_in_sequel_datetime
      assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
      after_ended_time = now_in_sequel_datetime
      after_end_row = get_session_hoc_activity_entry
      assert_datetime_within(after_end_row[:started_at], before_began_time, after_began_time)
      assert_datetime_within(after_end_row[:finished_at], before_ended_time, after_ended_time)
    end

    private
    def assert_datetime_within(after_start_time, before_begin_time, after_begin_time)
      assert (before_begin_time..after_begin_time).cover?(after_start_time)
    end

    def now_in_sequel_datetime
      Sequel.string_to_datetime(Time.now.utc.to_s)
    end

    def get_session_hoc_activity_entry
      DB[:hoc_activity].where(session: @mock_session.cookie_jar['hour_of_code']).first
    end

    def with_test_company(name)
      remove_test_company(name)
      DB[:forms].insert(kind: 'CompanyProfile',
                        name: name,
                        secret: 'notasecret',
                        email: 'test@test.com',
                        data: '{}',
                        created_ip: '0.0.0.0',
                        updated_ip: '0.0.0.0',
                        processed_data: '{}',
      )
    end

    def remove_test_company(name)
      DB[:forms].where(kind: 'CompanyProfile', name: name).delete
    end

    def make_certificate
      assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
      CGI::parse(@pegasus.last_request.query_string)['i'][0]
    end

    def assert_redirects_from_to(from, to)
      @pegasus.get from
      assert_equal 302, @pegasus.last_response.status
      @pegasus.follow_redirect!
      assert_includes @pegasus.last_request.url, to
    end

    def assert_successful_get(path)
      assert_code_on_get(200, path)
    end

    def assert_successful_png_get(path)
      assert_code_on_get(200, path)
      assert_equal 'image/png', @pegasus.last_response['Content-Type']
    end

    def assert_successful_jpeg_get(path)
      assert_code_on_get(200, path)
      assert_equal 'image/jpeg', @pegasus.last_response['Content-Type']
    end

    def assert_not_found_get(path)
      assert_code_on_get(404, path)
    end

    def assert_code_on_get(code, path)
      @pegasus.get path
      assert_equal code, @pegasus.last_response.status
    end
  end
end
