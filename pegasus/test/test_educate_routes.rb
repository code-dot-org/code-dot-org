require_relative './test_helper'
require 'minitest/autorun'
require 'rack/test'
require_relative 'fixtures/mock_pegasus'

class EducateRoutesTest < Minitest::Test
  describe 'Educate Routes' do
    before do
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @mock_session = Rack::MockSession.new(MockPegasus.new, 'code.org')
      @pegasus = Rack::Test::Session.new(@mock_session)
    end

    it 'redirects the weblab test page to code studio' do
      @pegasus.get CDO.code_org_url('/educate/weblab-test')
      assert_equal 302, @pegasus.last_response.status
      expected_url = CDO.studio_url('/weblab/network-check', CDO.default_scheme)
      assert_equal expected_url, @pegasus.last_response['Location']
    end
  end
end
