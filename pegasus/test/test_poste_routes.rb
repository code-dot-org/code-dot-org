require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'

class PosteRoutesTest < Minitest::Test
  describe 'Poste Routes' do
    before do
      FakeDashboard.use_fake_database
      $log.level = Logger::ERROR # Pegasus spams debug logging otherwise
      @pegasus = Rack::Test::Session.new(Rack::MockSession.new(MockPegasus.new, "studio.code.org"))
    end

    describe 'POST /v2/poste/send-message' do
      it 'returns 403 "Forbidden" when not signed in' do
        with_role nil
        @pegasus.post "/v2/poste/send-message"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when signed in as a student' do
        with_role FakeDashboard::STUDENT
        @pegasus.post "/v2/poste/send-message"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'returns 403 "Forbidden" when signed in as a teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.post "/v2/poste/send-message"
        assert_equal 403, @pegasus.last_response.status
      end

      it 'succeeds when signed in as an admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.post "/v2/poste/send-message"
        assert_equal 200, @pegasus.last_response.status
      end
    end

    describe 'GET /u/:id' do
      EMAIL = 'example@example.com'.freeze
      HASHED_EMAIL = Digest::MD5.hexdigest(EMAIL).freeze

      before do
        FakeDashboard.use_fake_database
        $log.level = Logger::ERROR
        @pegasus = Rack::Test::Session.new(
          Rack::MockSession.new(MockPegasus.new, "studio.code.org")
        )

        @id = DB[:poste_deliveries].insert({
          created_at: DateTime.now,
          created_ip: '1.2.3.4',
          contact_id: '1',
          contact_email: EMAIL,
          hashed_email: HASHED_EMAIL,
          message_id: 1,
          params: {}.to_json
        })
      end

      it 'unsubscribes new contact' do
        DB.transaction(rollback: :always) do
          @pegasus.get "/u/#{Poste.encrypt(@id)}"
          assert DB[:contacts].
            where(hashed_email: HASHED_EMAIL)[:unsubscribed_at]
          assert_equal 200, @pegasus.last_response.status
        end
      end

      it 'unsubscribes existing contact' do
        DB.transaction(rollback: :always) do
          DB[:contacts].insert({
            email: EMAIL,
            hashed_email: HASHED_EMAIL,
            name: 'existing contact',
            created_at: DateTime.now,
            created_ip: '1.2.3.4',
            updated_at: DateTime.now,
            updated_ip: '1.2.3.4'
          })
          @pegasus.get "/u/#{Poste.encrypt(@id)}"
          assert DB[:contacts].
            where(hashed_email: HASHED_EMAIL)[:unsubscribed_at]
          assert_equal 200, @pegasus.last_response.status
        end
      end

      it 'noops with 200 if bad poste_deliveries id' do
        DB.transaction(rollback: :always) do
          @pegasus.get "/u/#{Poste.encrypt(@id + 1)}"
          assert DB[:contacts].where(hashed_email: HASHED_EMAIL).empty?
          assert_equal 200, @pegasus.last_response.status
        end
      end
    end

    # Stubs the user ID for the duration of the test to match the ID of the
    # user hash given (e.g. FakeDashboard::STUDENT or FakeDashboard::TEACHER).
    # The result should be pulled in through the mock database.
    # @param [Hash] role
    def with_role(role)
      Documents.any_instance.stubs(:dashboard_user_id).returns(role.nil? ? nil : role[:id])
    end
  end
end
