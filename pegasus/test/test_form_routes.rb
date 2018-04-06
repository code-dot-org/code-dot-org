# Tests for the routes in form_routes.rb

require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'
require_relative 'sequel_test_case'

class FormRoutesTest < SequelTestCase
  describe 'Form Routes' do
    before do
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    describe 'POST /forms/:kind' do
      it 'returns 400 for non-existent form kind' do
        @pegasus.post '/forms/nonexistent', '{}', 'CONTENT_TYPE' => 'application/json;charset=utf-8'
        assert_equal 400, @pegasus.last_response.status
      end
    end

    describe 'POST /forms/:kind/query' do
      it 'returns 400 for non-existent form kind' do
        @pegasus.post '/forms/nonexistent/query', '{}', 'CONTENT_TYPE' => 'application/json;charset=utf-8'
        assert_equal 400, @pegasus.last_response.status
      end
    end
  end
end
