require 'minitest/autorun'
require 'rack/test'
require 'mocha/mini_test'
require_relative 'fixtures/fake_dashboard'
require_relative 'fixtures/mock_pegasus'
require 'cdo/poste'

# Always rollback
# Adapted from http://sequel.jeremyevans.net/rdoc/files/doc/testing_rdoc.html#label-without+minitest-hooks
class Minitest::Spec
  def run(*args, &block)
    result = nil
    Sequel::Model.db.transaction(rollback: :always, auto_savepoint: true) {result = super}
    result
  end
end

class PosteRoutesTest < Minitest::Test
  EMAIL = 'fake_email@example.net'.freeze
  HASHED_EMAIL = Digest::MD5.hexdigest(EMAIL).freeze

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
        assert_response 403
      end

      it 'returns 403 "Forbidden" when signed in as a student' do
        with_role FakeDashboard::STUDENT
        @pegasus.post "/v2/poste/send-message"
        assert_response 403
      end

      it 'returns 403 "Forbidden" when signed in as a teacher' do
        with_role FakeDashboard::TEACHER
        @pegasus.post "/v2/poste/send-message"
        assert_response 403
      end

      it 'succeeds when signed in as an admin' do
        with_role FakeDashboard::ADMIN
        @pegasus.post "/v2/poste/send-message"
        assert_response 200
      end
    end

    describe 'GET /u/:id' do
      before do
        @id = create_poste_delivery
      end

      it 'unsubscribes new contact' do
        @pegasus.get "/u/#{Poste.encrypt(@id)}"
        assert DB[:contacts].
          where(hashed_email: HASHED_EMAIL)[:unsubscribed_at]
        assert_response 200
      end

      it 'unsubscribes existing contact' do
        create_contact

        @pegasus.get "/u/#{Poste.encrypt(@id)}"
        assert DB[:contacts].
          where(hashed_email: HASHED_EMAIL)[:unsubscribed_at]
        assert_response 200
      end

      it 'noops with 200 if bad poste_deliveries id' do
        @pegasus.get "/u/#{Poste.encrypt(@id + 1)}"
        assert DB[:contacts].where(hashed_email: HASHED_EMAIL).empty?
        assert_response 200
      end
    end

    describe 'GET /unsubscribe/:email' do
      it 'unsubscribes existing contact' do
        create_contact

        @pegasus.get "/unsubscribe/#{EMAIL}"
        assert DB[:contacts].
          where(hashed_email: HASHED_EMAIL)[:unsubscribed_at]
        assert_response 200
      end

      it 'noops with 200 for non-existing contact' do
        @pegasus.get '/unsubscribe/bademail@example.com'
        assert DB[:contacts].where(hashed_email: HASHED_EMAIL).empty?
        assert_response 200
      end
    end

    describe 'GET /o/:id' do
      before do
        @id = create_poste_delivery
      end

      it 'creates poste_opens row' do
        @pegasus.get "/o/#{Poste.encrypt(@id)}"
        assert DB[:poste_opens].where(delivery_id: @id).any?
      end

      it 'creates no poste_opens row with bad poste_deliveries id' do
        @pegasus.get "/o/#{Poste.encrypt(@id + 1)}"
        assert_response 404
        assert DB[:poste_opens].where(delivery_id: @id).empty?
      end

      it 'creates no poste_opens row with an undecryptable id' do
        CDO.log.expects(:warn).with('Unable to decrypt poste id: invalid. Error: invalid base64')
        @pegasus.get '/o/invalid'
        assert_response 404
        assert DB[:poste_opens].where(delivery_id: @id).empty?
      end
    end

    describe 'GET /l/:id/:url' do
      before do
        @id = create_poste_delivery
        @url_id = create_poste_url
      end

      it 'creates poste_clicks row and redirects' do
        @pegasus.get "/l/#{Poste.encrypt(@id)}/#{Base64.urlsafe_encode64(@url_id.to_s)}"
        assert_response 302
        assert @pegasus.last_response['Location'].end_with? 'my url'
        assert DB[:poste_clicks].where(delivery_id: @id, url_id: @url_id).any?
      end

      it 'creates no poste_clicks row with a bad delivery id' do
        @pegasus.get "/l/#{Poste.encrypt(@id + 1)}/#{Base64.urlsafe_encode64(@url_id.to_s)}"
        assert_response 404
        assert DB[:poste_clicks].where(delivery_id: @id).empty?
      end

      it 'creates no poste_clicks row with an undecryptable id' do
        CDO.log.expects(:warn).with('Unable to decrypt poste id: invalid. Error: invalid base64')
        @pegasus.get "/l/invalid/#{Base64.urlsafe_encode64(@url_id.to_s)}"
        assert_response 404
        assert DB[:poste_clicks].where(delivery_id: @id).empty?
      end

      it 'creates no poste_clicks row with a bad url id' do
        @pegasus.get "/l/#{Poste.encrypt(@id)}/#{Base64.urlsafe_encode64((@url_id + 1).to_s)}"
        assert_response 404
        assert DB[:poste_clicks].where(delivery_id: @id).empty?
      end

      it 'creates no poste_clicks row with an undecodable url id' do
        @pegasus.get "/l/#{Poste.encrypt(@id)}/invalid"
        assert_response 404
        assert DB[:poste_clicks].where(delivery_id: @id).empty?
      end
    end

    private

    # Stubs the user ID for the duration of the test to match the ID of the
    # user hash given (e.g. FakeDashboard::STUDENT or FakeDashboard::TEACHER).
    # The result should be pulled in through the mock database.
    # @param [Hash] role
    def with_role(role)
      Documents.any_instance.stubs(:dashboard_user_id).returns(role.nil? ? nil : role[:id])
    end

    def assert_response(response)
      assert_equal response, @pegasus.last_response.status
    end

    def create_poste_delivery
      DB[:poste_deliveries].insert(
        {
          created_at: DateTime.now,
          created_ip: '1.2.3.4',
          contact_id: '1',
          contact_email: EMAIL,
          hashed_email: HASHED_EMAIL,
          message_id: 1,
          params: {}.to_json
        }
      )
    end

    def create_contact
      DB[:contacts].insert(
        {
          email: EMAIL,
          hashed_email: HASHED_EMAIL,
          name: 'existing contact',
          created_at: DateTime.now,
          created_ip: '1.2.3.4',
          updated_at: DateTime.now,
          updated_ip: '1.2.3.4'
        }
      )
    end

    def create_poste_url
      DB[:poste_urls].insert(
        {
          url: 'my url',

          # Obtained by Digest::MD5.hexdigest('my url')
          hash: 'c4a8698678999acd754ec6063ce3b7f8',
        }
      )
    end
  end
end
