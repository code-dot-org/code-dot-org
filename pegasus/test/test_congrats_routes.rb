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
        ScriptConstants::ACCELERATED_NAME,
        ScriptConstants::COURSE1_NAME,
        ScriptConstants::COURSE2_NAME,
        ScriptConstants::COURSE3_NAME,
        ScriptConstants::COURSE4_NAME,
        ScriptConstants::COURSEA_NAME,
        ScriptConstants::COURSEB_NAME,
        ScriptConstants::COURSEC_NAME,
        ScriptConstants::COURSED_NAME,
        ScriptConstants::COURSEE_NAME,
        ScriptConstants::COURSEF_NAME,
        ScriptConstants::EXPRESS_NAME,
        ScriptConstants::PRE_READER_EXPRESS_NAME,
        ScriptConstants::COURSEA_2018_NAME,
        ScriptConstants::COURSEB_2018_NAME,
        ScriptConstants::COURSEC_2018_NAME,
        ScriptConstants::COURSED_2018_NAME,
        ScriptConstants::COURSEE_2018_NAME,
        ScriptConstants::COURSEF_2018_NAME,
        ScriptConstants::EXPRESS_2018_NAME,
        ScriptConstants::PRE_READER_EXPRESS_2018_NAME
      ].each do |course|
        @pegasus.get "/congrats/#{course}"
        assert_equal 200, @pegasus.last_response.status
      end
    end

    it 'redirects to a generic congrats page for other courses' do
      ScriptConstants::CATEGORIES[:hoc].each do |course|
        next if course.nil?

        @pegasus.get "/congrats/#{CGI.escape(course)}"
        assert_equal 302, @pegasus.last_response.status
        @pegasus.follow_redirect!
        assert_equal @pegasus.last_request.path, '/congrats'
      end
    end
  end
end
