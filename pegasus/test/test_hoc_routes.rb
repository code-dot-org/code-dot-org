require_relative './test_helper'
require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require 'shared_resources'
require_relative 'fixtures/mock_pegasus'

# Set up the rack environment to be test and recreate the Gatekeeper and DCDO in that mode.
CDO.stubs(rack_env: :test)
def redefine_const_without_warning(const, value)
  self.class.send(:remove_const, const)
  self.class.const_set(const, value)
end
redefine_const_without_warning :Gatekeeper, GatekeeperBase.create
redefine_const_without_warning :DCDO, DCDOBase.create

class HocRoutesTest < Minitest::Test
  describe 'HOC Routes' do
    before do
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @mock_session = Rack::MockSession.new(MockPegasus.new, 'studio.code.org')
      @pegasus = Rack::Test::Session.new(@mock_session)
      DCDO.clear
      Gatekeeper.clear
    end

    it 'redirects to tutorial via shortcode' do
      assert_redirects_from_to '/hoc', '/hoc/reset'
    end

    it 'gets certificate info' do
      @pegasus.post '/api/hour/certificate'
      assert_equal 200, @pegasus.last_response.status
    end

    it 'starts tutorial' do
      assert_redirects_from_to '/api/hour/begin/mc', '/minecraft'
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
      assert_includes @pegasus.last_request.url, "&s=#{Base64.urlsafe_encode64('mc')}"
    end

    it 'redirects batch certificate page to code studio' do
      @pegasus.get CDO.code_org_url('/certificates')
      assert_equal 301, @pegasus.last_response.status
      expected_url = 'https://studio.code.org/certificates/batch'
      assert_equal expected_url, @pegasus.last_response['Location'].strip
    end

    it 'redirects blank certificate page to code studio' do
      @pegasus.get CDO.code_org_url('/certificates/blank')
      assert_equal 301, @pegasus.last_response.status
      expected_url = 'https://studio.code.org/certificates/blank'
      assert_equal expected_url, @pegasus.last_response['Location'].strip
    end

    it 'redirects sharecertificate page to code studio' do
      @pegasus.get CDO.code_org_url('/sharecertificate')
      assert_equal 301, @pegasus.last_response.status
      expected_url = 'https://studio.code.org/certificates/blank'
      assert_equal expected_url, @pegasus.last_response['Location'].strip
    end

    it 'redirects vanilla congrats page to code studio' do
      @pegasus.get CDO.code_org_url('/congrats')
      assert_equal 302, @pegasus.last_response.status
      expected_url = CDO.studio_url('/congrats', CDO.default_scheme)
      assert_equal expected_url, @pegasus.last_response['Location']
    end

    it 'preserves url params when redirecting congrats page' do
      @pegasus.get CDO.code_org_url('/congrats?i=foo&s=bar')
      assert_equal 302, @pegasus.last_response.status
      expected_url = CDO.studio_url('/congrats?i=foo&s=bar', CDO.default_scheme)
      assert_equal expected_url, @pegasus.last_response['Location']
    end

    it 'starts and ends given tutorial, tracking company and tutorial' do
      DB.transaction(rollback: :always) do
        with_test_company 'testcompany'

        before_start_row = get_session_hoc_activity_entry
        assert_nil before_start_row

        assert_redirects_from_to '/api/hour/begin_company/testcompany',
          '/learn?company=testcompany'
        assert_redirects_from_to '/api/hour/begin/mc?company=testcompany',
          '/minecraft'

        after_start_row = get_session_hoc_activity_entry
        assert_equal 'testcompany', after_start_row[:company]
        assert_equal 'mc', after_start_row[:tutorial]
        assert after_start_row[:started_at]

        assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
        assert_includes @pegasus.last_request.url, "&s=#{Base64.urlsafe_encode64('mc')}"
        assert_includes @pegasus.last_request.url, '&co=testcompany'

        after_end_row = get_session_hoc_activity_entry
        assert_equal 'testcompany', after_end_row[:company]
        assert_equal 'mc', after_end_row[:tutorial]
        assert after_end_row[:finished_at]
      end
    end

    it 'starts and ends given tutorial, tracking company and tutorial using cookie' do
      DB.transaction(rollback: :always) do
        with_test_company 'testcompany'

        before_start_row = get_session_hoc_activity_entry
        assert_nil before_start_row

        @mock_session.cookie_jar['company'] = 'testcompany'

        assert_redirects_from_to '/api/hour/begin/mc', '/minecraft'

        after_start_row = get_session_hoc_activity_entry
        assert_equal 'testcompany', after_start_row[:company]
        assert_equal 'mc', after_start_row[:tutorial]
        assert after_start_row[:started_at]

        assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
        assert_includes @pegasus.last_request.url, "&s=#{Base64.urlsafe_encode64('mc')}"
        assert_includes @pegasus.last_request.url, '&co=testcompany'

        after_end_row = get_session_hoc_activity_entry
        assert_equal 'testcompany', after_end_row[:company]
        assert_equal 'mc', after_end_row[:tutorial]
        assert after_end_row[:finished_at]
      end
    end

    it 'starts and ends given tutorial, tracking company and tutorial, with hoc_activity_sample_weight 100' do
      DB.transaction(rollback: :always) do
        DCDO.set('hoc_activity_sample_weight', 100)  # Sample 1/100 of the sessions.
        with_test_company 'testcompany'

        before_start_row = get_session_hoc_activity_entry
        assert_nil before_start_row

        assert_redirects_from_to '/api/hour/begin_company/testcompany',
          '/learn?company=testcompany'
        assert_redirects_from_to '/api/hour/begin/mc?company=testcompany',
          '/minecraft'

        after_start_row = get_session_hoc_activity_entry
        assert_equal 'testcompany', after_start_row[:company]
        assert_equal 'mc', after_start_row[:tutorial]
        assert after_start_row[:started_at]

        assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
        assert_includes @pegasus.last_request.url, "&s=#{Base64.urlsafe_encode64('mc')}"
        assert_includes @pegasus.last_request.url, '&co=testcompany'

        after_end_row = get_session_hoc_activity_entry
        assert_equal 'testcompany', after_end_row[:company]
        assert_equal 'mc', after_end_row[:tutorial]
        assert after_end_row[:finished_at]
      end
    end

    it 'starts and ends given tutorial, tracking time' do
      DB.transaction(rollback: :always) do
        before_start_row = get_session_hoc_activity_entry
        assert_nil before_start_row

        before_began_time = now_in_sequel_datetime
        assert_redirects_from_to '/api/hour/begin/mc', '/minecraft'
        after_began_time = now_in_sequel_datetime

        after_start_row = get_session_hoc_activity_entry

        assert_equal 1.0, get_sampling_weight(after_start_row)
        assert_datetime_within(after_start_row[:started_at], before_began_time, after_began_time)
        assert_nil after_start_row[:finished_at]

        before_ended_time = now_in_sequel_datetime
        assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
        after_ended_time = now_in_sequel_datetime
        after_end_row = get_session_hoc_activity_entry
        assert_datetime_within(after_end_row[:started_at], before_began_time, after_began_time)
        assert_datetime_within(after_end_row[:finished_at], before_ended_time, after_ended_time)
      end
    end

    it 'starts and ends given tutorial with tracking pixel, tracking time' do
      DB.transaction(rollback: :always) do
        before_start_row = get_session_hoc_activity_entry
        assert_nil before_start_row

        before_began_time = now_in_sequel_datetime
        assert_successful_png_get '/api/hour/begin_mc.png'
        after_began_time = now_in_sequel_datetime

        after_start_row = get_session_hoc_activity_entry
        assert 'mc', after_start_row[:tutorial]

        assert_datetime_within(after_start_row[:pixel_started_at], before_began_time, after_began_time)
        assert_nil after_start_row[:pixel_finished_at]

        before_ended_time = now_in_sequel_datetime
        assert_successful_png_get '/api/hour/finish_mc.png'
        after_ended_time = now_in_sequel_datetime

        after_end_row = get_session_hoc_activity_entry
        assert_datetime_within(after_end_row[:pixel_finished_at], before_ended_time, after_ended_time)
      end
    end

    it 'respects sample weight and records weight for sessions in sample' do
      DB.transaction(rollback: :always) do
        DCDO.set('hoc_activity_sample_weight', 100)  # Sample 1/100 of the sessions.
        Kernel.stubs(:rand).returns(1 / 1000.0)  # Pretend that the session is in the sample.
        assert_redirects_from_to '/api/hour/begin/mc', '/minecraft'
        row = get_session_hoc_activity_entry
        session = row[:session]
        assert_equal 100, get_sampling_weight(row)

        Kernel.stubs(:rand).returns(0.6)  # Once in the sample we should stay in the sample.
        before_ended_time = now_in_sequel_datetime
        assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
        after_ended_time = now_in_sequel_datetime
        after_end_row = get_session_hoc_activity_entry
        assert_datetime_within(after_end_row[:finished_at], before_ended_time, after_ended_time)

        after_end_row = get_session_hoc_activity_entry
        assert_equal session, row[:session]
        assert_in_delta 100.0, get_sampling_weight(after_end_row)
      end
    end

    it 'does not write at start of sessions not in sample' do
      DB.transaction(rollback: :always) do
        DCDO.set('hoc_activity_sample_weight', 2)
        Kernel.stubs(:rand).returns(0.75)  # Pretend that the session is not in the sample.
        assert_redirects_from_to '/api/hour/begin/mc', '/minecraft'

        # Make sure no row was written or session_id assigned
        row = get_session_hoc_activity_entry
        assert_nil row
        assert_equal 'HOC_UNSAMPLED', @mock_session.cookie_jar['hour_of_code']

        # Despite not being in the sample, we *do* want to write a session row when
        # they complete the course so that certificate generation works.
        assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
        after_end_row = get_session_hoc_activity_entry
        assert_equal 0, get_sampling_weight(after_end_row)
      end
    end

    it 'handles 0 sampling weight correctly' do
      DB.transaction(rollback: :always) do
        DCDO.set('hoc_activity_sample_weight', 0)
        Kernel.stubs(:rand).returns(0.1)
        assert_redirects_from_to '/api/hour/begin/mc', '/minecraft'

        row = get_session_hoc_activity_entry
        assert_nil row
        assert_equal 'HOC_UNSAMPLED', @mock_session.cookie_jar['hour_of_code']
      end
    end

    it 'handles negative sampling weight correctly' do
      DB.transaction(rollback: :always) do
        DCDO.set('hoc_activity_sample_weight', -1)
        Kernel.stubs(:rand).returns(0.1)
        assert_redirects_from_to '/api/hour/begin/mc', '/minecraft'

        row = get_session_hoc_activity_entry
        assert_nil row
        assert_equal 'HOC_UNSAMPLED', @mock_session.cookie_jar['hour_of_code']
      end
    end

    it 'records weight for tracking pixel in sample' do
      DB.transaction(rollback: :always) do
        DCDO.set('hoc_activity_sample_weight', 2)
        Kernel.stubs(:rand).returns(0.49)
        assert_successful_png_get '/api/hour/begin_mc.png'
        row = get_session_hoc_activity_entry
        session = row[:session]
        assert_equal 2, get_sampling_weight(row)

        assert_successful_png_get '/api/hour/finish_mc.png'
        after_end_row = get_session_hoc_activity_entry
        assert_equal session, after_end_row[:session]
        assert_equal 2, get_sampling_weight(row)
      end
    end

    it 'does not write for start or end tracking pixel for session not in sample' do
      DB.transaction(rollback: :always) do
        DCDO.set('hoc_activity_sample_weight', 2)
        Kernel.stubs(:rand).returns(0.51)
        assert_successful_png_get '/api/hour/begin_mc.png'
        row = get_session_hoc_activity_entry
        assert_nil row
        assert_equal 'HOC_UNSAMPLED', @mock_session.cookie_jar['hour_of_code']

        # Should remain unsampled regardless of subsequent random nubmers generated.
        Kernel.stubs(:rand).returns(0.0)
        assert_successful_png_get '/api/hour/finish_mc.png'
        after_end_row = get_session_hoc_activity_entry
        assert_nil after_end_row
        assert_equal 'HOC_UNSAMPLED', @mock_session.cookie_jar['hour_of_code']
      end
    end

    # Extracts the sampling weight from a hoc_activity row. We would like to add
    # a separate column for maintaining this but this is too expensive/risky before
    # Hour of Code 2015, so it is current embedded in the session id. For example,
    # _2_7af16d90c00ceb6a82d4361470fd843d encodes a weight of 2.
    private def get_sampling_weight(row)
      row[:session].split('_')[1].to_i
    end

    private def assert_datetime_within(after_start_time, before_begin_time, after_begin_time)
      assert (before_begin_time..after_begin_time).cover?(after_start_time)
    end

    private def now_in_sequel_datetime
      Sequel.string_to_datetime(Time.now.utc.to_s)
    end

    private def get_session_hoc_activity_entry
      DB[:hoc_activity].where(session: @mock_session.cookie_jar['hour_of_code']).first
    end

    private def with_test_company(name)
      remove_test_company(name)
      DB[:forms].insert(kind: 'CompanyProfile',
                        name: name,
                        secret: 'notasecret',
                        email: 'test@test.com',
                        data: '{}',
                        created_ip: '0.0.0.0',
                        updated_ip: '0.0.0.0',
                        processed_data: '{}',
                        created_at: DateTime.now,
                        updated_at: DateTime.now
      )
    end

    private def remove_test_company(name)
      DB[:forms].where(kind: 'CompanyProfile', name: name).delete
    end

    private def make_certificate
      assert_redirects_from_to '/api/hour/finish/mc', '/congrats'
      CGI.parse(@pegasus.last_request.query_string)['i'][0]
    end

    private def assert_redirects_from_to(from, to)
      @pegasus.get from
      assert_equal 302, @pegasus.last_response.status
      @pegasus.follow_redirect!
      assert_includes @pegasus.last_request.url, to
    end

    private def assert_successful_get(path)
      assert_code_on_get(200, path)
    end

    private def assert_successful_png_get(path)
      assert_code_on_get(200, path)
      assert_equal 'image/png', @pegasus.last_response['Content-Type']
    end

    private def assert_successful_jpeg_get(path)
      assert_code_on_get(200, path)
      assert_equal 'image/jpeg', @pegasus.last_response['Content-Type']
    end

    private def assert_not_found_get(path)
      assert_code_on_get(404, path)
    end

    private def assert_code_on_get(code, path)
      @pegasus.get path
      assert_equal code, @pegasus.last_response.status
    end
  end
end
