require 'test_helper'
require 'contentful'
require_relative '../../engines/marketing/app/helpers/external_notifications_helper'

class NotificationsControllerTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks
  TestEntry = Struct.new(:external_id, :title, :description, :icon_name, :href_links, :ai_prompts, :priority, :published_at, :expires_at, :read_at, keyword_init: true)

  let(:entry_id_1) {SecureRandom.hex(10)}
  let(:entry_id_2) {SecureRandom.hex(10)}
  let(:yesterday) {1.day.ago.iso8601}
  let(:today) {Time.now.iso8601}
  let(:tomorrow) {1.day.from_now.iso8601}
  let(:later) {2.days.from_now.iso8601}
  let(:user) {create(:user)}
  let(:other_user) {create(:user)}

  let(:entry_1) do
    TestEntry.new(
      external_id: entry_id_1,
      title: 'Notification 1',
      description: 'Description 1',
      icon_name: 'icon1',
      href_links: [{'url' => 'https://example.com/1', 'text' => 'Link 1'}],
      ai_prompts: [{'text' => 'Prompt 1', 'prompt' => 'Prompt 1 text'}],
      priority: 0,
      published_at: yesterday,
      expires_at: tomorrow,
      read_at: today
      )
  end

  let(:entry_2) do
    TestEntry.new(
      external_id: entry_id_2,
      title: 'Notification 2',
      description: 'Description 2',
      icon_name: 'icon2',
      href_links: [{'url' => 'https://example.com/2', 'text' => 'Link 2'}],
      ai_prompts: [{'text' => 'Prompt 2', 'prompt' => 'Prompt 2 text'}],
      priority: 0,
      published_at: yesterday,
      expires_at: later,
      read_at: nil
      )
  end

  before do
    sign_in user
  end

  describe '#index' do
    context 'when user is not authenticated' do
      it 'requires authentication' do
        sign_out user
        get '/notifications'
        assert_response :redirect
        assert_redirected_to "/users/sign_in"
      end
    end

    context 'with contentful data' do
      it 'returns user external notifications' do
        ExternalNotificationsHelper.stubs(:get_contentful_notifications_for_user).returns([entry_1, entry_2])
        get '/notifications'

        assert_response :success

        response_data = JSON.parse(@response.body)
        _(response_data.length).must_equal 2

        _(response_data[0]["externalId"]).must_equal entry_id_1
        _(response_data[0]["title"]).must_equal 'Notification 1'
        _(response_data[0]["description"]).must_equal 'Description 1'
        _(response_data[0]["iconName"]).must_equal 'icon1'
        _(response_data[0]["hrefLinks"]).must_equal [{'url' => 'https://example.com/1', 'text' => 'Link 1'}]
        _(response_data[0]["aiPrompts"]).must_equal [{'text' => 'Prompt 1', 'prompt' => 'Prompt 1 text'}]
        _(response_data[0]["priority"]).must_equal 0
        _(response_data[0]["publishedAt"]).must_equal yesterday
        _(response_data[0]["expiresAt"]).must_equal tomorrow
        _(response_data[0]["readAt"]).must_equal today

        _(response_data[1]["externalId"]).must_equal entry_id_2
      end
    end
  end

  describe '#mark_as_read' do
    context 'when user is not authenticated' do
      it 'requires authentication' do
        external_notification = create_external_notification(user)
        sign_out user

        post '/notifications/mark_as_read', params: {notification_ids: [external_notification.id]}

        assert_redirected_to "/users/sign_in"
      end
    end

    context 'with valid parameters' do
      it 'successfully creates a record and marks external notifications as read' do
        post '/notifications/mark_as_read', params: {external_notification_ids: ['TEST_ENTRY_ID_1']}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "1 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 1

        _(ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_1', user: user)&.read_at).wont_be_nil
      end

      it 'successfully creates a record and marks external notifications for multiple notifications' do
        post '/notifications/mark_as_read', params: {external_notification_ids: ['TEST_ENTRY_ID_1', 'TEST_ENTRY_ID_2']}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "2 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 2

        _(ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_1', user: user)&.read_at).wont_be_nil
        _(ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_2', user: user)&.read_at).wont_be_nil
      end

      it 'creates and updates multiple notifications' do
        yesterday = 1.day.ago
        external_notification1 = create_external_notification(user, external_id: 'TEST_ENTRY_ID_1', read_at: yesterday)

        post '/notifications/mark_as_read', params: {external_notification_ids: ['TEST_ENTRY_ID_1', 'TEST_ENTRY_ID_2']}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "2 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 2

        external_notification1.reload
        _(ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_1', user: user)&.read_at).wont_be_nil
        _(external_notification1.read_at.to_i).must_equal yesterday.to_i
        _(ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_2', user: user)&.read_at).wont_be_nil
      end

      it 'does not update already read external notifications' do
        yesterday = 1.day.ago
        external_notification1 = create_external_notification(user, external_id: 'TEST_ENTRY_ID_1', read_at: yesterday)

        post '/notifications/mark_as_read', params: {external_notification_ids: ['TEST_ENTRY_ID_1', 'TEST_ENTRY_ID_2']}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["marked_count"]).must_equal 2

        external_notification1.reload

        _(external_notification1.read_at.to_i).must_equal yesterday.to_i
        _(ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_2', user: user)&.read_at).wont_be_nil
      end
    end

    context 'with invalid parameters' do
      it 'returns error for empty notification_ids' do
        post '/notifications/mark_as_read', params: {external_notification_ids: []}
        assert_response :bad_request

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "error"
        _(response_data["message"]).must_equal "No notification IDs provided"
      end

      it 'returns error when no notification_ids param provided' do
        post '/notifications/mark_as_read', params: {}
        assert_response :bad_request

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "error"
        _(response_data["message"]).must_equal "No notification IDs provided"
      end
    end
  end

  private def create_external_notification(user, attributes = {})
    default_attributes = {
      user: user,
      external_id: "test_external_id_#{SecureRandom.hex(4)}",
      is_dismissed: false
    }

    ExternalNotification.create!(default_attributes.merge(attributes))
  end
end
