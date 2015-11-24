require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/mock_pegasus'

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
      assert_redirects_from_to '/api/hour/begin/mc', CDO.code_org_url('/mc')
    end


    it 'starts tutorial with png image' do
      assert_successful_get '/api/hour/begin_mc.png'
      assert_equal 'image/png', @pegasus.last_response['Content-Type']
    end

    it 'ends tutorial' do
      assert_redirects_from_to '/api/hour/finish', CDO.code_org_url('/congrats')
    end

    it 'ends given tutorial' do
      assert_redirects_from_to '/api/hour/finish/mc', CDO.code_org_url('/congrats')
      assert_includes @pegasus.last_request.url, '&s=mc'
    end

    it 'starts and ends given tutorial, tracking company and tutorial' do
      with_test_company 'testcompany'

      before_start_row = get_session_hoc_activity_entry
      assert_nil before_start_row

      assert_redirects_from_to '/api/hour/begin_company/testcompany',
                               CDO.code_org_url('/learn?company=testcompany')
      assert_redirects_from_to '/api/hour/begin/mc?company=testcompany',
                               CDO.code_org_url('/mc')

      after_start_row = get_session_hoc_activity_entry
      assert_equal('testcompany', after_start_row[:company])
      assert_equal('mc', after_start_row[:tutorial])
      assert(after_start_row[:started_at])

      # track tutorial end
      assert_redirects_from_to '/api/hour/finish/mc', CDO.code_org_url('/congrats')
      assert_includes @pegasus.last_request.url, '&s=mc'
      assert_includes @pegasus.last_request.url, '&co=testcompany'

      after_end_row = get_session_hoc_activity_entry
      assert(after_end_row[:finished_at])
    end

    it 'starts and ends given tutorial, tracking time' do
      before_start_row = get_session_hoc_activity_entry
      assert_nil before_start_row

      before_began_time = Sequel.string_to_datetime(Time.now.utc.to_s)
      assert_redirects_from_to '/api/hour/begin/mc', CDO.code_org_url('/mc')
      after_began_time = Sequel.string_to_datetime(Time.now.utc.to_s)

      after_start_row = get_session_hoc_activity_entry
      assert_datetime_within(after_start_row[:started_at], before_began_time, after_began_time)
      assert_nil after_start_row[:finished_at]

      before_ended_time = Sequel.string_to_datetime(Time.now.utc.to_s)
      assert_redirects_from_to '/api/hour/finish/mc', CDO.code_org_url('/congrats')
      after_ended_time = Sequel.string_to_datetime(Time.now.utc.to_s)
      after_end_row = get_session_hoc_activity_entry
      assert_datetime_within(after_end_row[:finished_at], before_ended_time, after_ended_time)
    end

    it 'ends given tutorial with png image' do
      assert_successful_get '/api/hour/finish_mc.png'
      assert_equal 'image/png', @pegasus.last_response['Content-Type']
    end

    def assert_datetime_within(after_start_time, before_begin_time, after_begin_time)
      assert (before_begin_time..after_begin_time).cover?(after_start_time)
    end

    def get_session_hoc_activity_entry
      DB[:hoc_activity].where(session: @mock_session.cookie_jar['hour_of_code']).first
    end

    def with_test_company(name)
      DB[:forms].where(kind: 'CompanyProfile').delete
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

    def assert_redirects_from_to(from, to)
      @pegasus.get from
      assert_equal 302, @pegasus.last_response.status
      @pegasus.follow_redirect!
      assert_includes @pegasus.last_request.url, to
    end

    def assert_successful_get(path)
      @pegasus.get path
      assert_equal 200, @pegasus.last_response.status
    end
  end
end
