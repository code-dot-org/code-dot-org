require_relative './test_helper'
require 'minitest/autorun'
require 'rack/test'
require_relative 'fixtures/mock_pegasus'

class CongratsRoutesTest < Minitest::Test
  describe 'Congrats Routes' do
    before do
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @mock_session = Rack::MockSession.new(MockPegasus.new, 'code.org')
      @pegasus = Rack::Test::Session.new(@mock_session)
    end

    it 'shows a course-specific congrats page for appropriate courses' do
      [
        'accelerated',
        'course1',
        'other'
      ].each do |course|
        @pegasus.get CDO.code_org_url("/congrats/#{course}")
        assert_equal 302, @pegasus.last_response.status
        expected_url = CDO.studio_url("/congrats?s=#{Base64.urlsafe_encode64(course)}", CDO.default_scheme)
        assert_equal expected_url, @pegasus.last_response['Location'], "for course #{course.inspect}"
      end
    end
  end
end
