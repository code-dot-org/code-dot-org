require 'test_helper'
require 'contentful'

class NotificationsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  NOTIFICATION_CONTENTFUL_CONTENT_TYPE = 'dashboard-notification'
  LOCALE = 'en-US'
  ENTRY_ID_1 = SecureRandom.hex(10)
  ENTRY_ID_2 = SecureRandom.hex(10)

  def tomorrow
    @tomorrow ||= 1.day.from_now
  end

  def later
    @later ||= 2.days.from_now
  end

  TestEntry = Struct.new(:id, :content_type, :fields, keyword_init: true)

  def entry_1
    @entry_1 ||= TestEntry.new(
      content_type: NOTIFICATION_CONTENTFUL_CONTENT_TYPE,
      id: ENTRY_ID_1,
      fields: {
        title: 'Notification 1',
        description: 'Description 1',
        icon_name: 'icon1',
        href_links: [{'url' => 'https://example.com/1', 'text' => 'Link 1'}],
        ai_prompts: [{'text' => 'Prompt 1', 'prompt' => 'Prompt 1 text'}],
        priority: 0,
        expires_at: tomorrow,
      },
    )
  end

  def entry_2
    @entry_2 ||= TestEntry.new(
      content_type: NOTIFICATION_CONTENTFUL_CONTENT_TYPE,
      id: ENTRY_ID_2,
      fields: {
        title: 'Notification 2',
        description: 'Description 2',
        icon_name: 'icon1',
        href_links: [{'url' => 'https://example.com/2', 'text' => 'Link 2'}],
        ai_prompts: [{'text' => 'Prompt 2', 'prompt' => 'Prompt 2 text'}],
        priority: 0,
        expires_at: later,
      },
    )
  end

  before do
    @user = create(:user)
    @other_user = create(:user)
    sign_in @user
  end

  test "index requires authentication" do
    sign_out @user
    get :index
    assert_redirected_to new_user_session_path
  end

  test "mark_as_read requires authentication" do
    external_notification = create_external_notification(@user)
    sign_out(@user)

    patch :mark_as_read, params: {notification_ids: [external_notification.id]}
    assert_redirected_to_sign_in
  end

  describe 'contentful tests' do
    before do
      Marketing::ContentfulClient.instance_variable_set(:@singleton__instance__, nil)
      Marketing::ContentfulClient.any_instance.expects(:entries).with(LOCALE, NOTIFICATION_CONTENTFUL_CONTENT_TYPE).returns([entry_1, entry_2])
    end

    test "index returns user external notifications in descending order by created_at" do
      get :index
      assert_response :success

      response_data = JSON.parse(@response.body)
      assert_equal 2, response_data.length

      assert_equal ENTRY_ID_1, response_data[0]["externalId"]
      assert_equal 'Notification 1', response_data[0]["title"]
      assert_equal 'Description 1', response_data[0]["description"]
      assert_equal 'icon1', response_data[0]["iconName"]
      assert_equal [{'url' => 'https://example.com/1', 'text' => 'Link 1'}], response_data[0]["hrefLinks"]
      assert_equal [{'text' => 'Prompt 1', 'prompt' => 'Prompt 1 text'}], response_data[0]["aiPrompts"]
      assert_equal 0, response_data[0]["priority"]
      assert_equal tomorrow.iso8601, response_data[0]["expiresAt"]

      assert_equal ENTRY_ID_2, response_data[1]["externalId"]
    end

    test "index only returns active external notifications" do
      create_external_notification(@user, external_id: ENTRY_ID_2, is_dismissed: true)

      get :index
      assert_response :success

      response_data = JSON.parse(@response.body)
      assert_equal 1, response_data.length
      assert_equal ENTRY_ID_1, response_data[0]["externalId"]
    end

    test "index adds read_at" do
      create_external_notification(@user, external_id: ENTRY_ID_1, read_at: tomorrow)
      create_external_notification(@user, external_id: ENTRY_ID_2, read_at: later)

      get :index
      assert_response :success

      response_data = JSON.parse(@response.body)
      assert_equal 2, response_data.length
      assert_equal ENTRY_ID_1, response_data[0]["externalId"]
      assert_equal tomorrow.iso8601, response_data[0]["readAt"]

      assert_equal ENTRY_ID_2, response_data[1]["externalId"]
      assert_equal later.iso8601, response_data[1]["readAt"]
    end
  end

  describe 'mark_as_read tests' do
    test "mark_as_read successfully creates a record and marks external notifications as read" do
      patch :mark_as_read, params: {external_notifications: ['TEST_ENTRY_ID_1']}
      assert_response :ok

      response_data = JSON.parse(@response.body)
      assert_equal "success", response_data["status"]
      assert_equal "1 notification(s) marked as read", response_data["message"]
      assert_equal 1, response_data["marked_count"]

      refute_nil ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_1', user: @user)&.read_at
    end

    test "mark_as_read successfully creates a record and marks external notifications for multiple notifications" do
      patch :mark_as_read, params: {external_notifications: ['TEST_ENTRY_ID_1', 'TEST_ENTRY_ID_2']}
      assert_response :ok

      response_data = JSON.parse(@response.body)
      assert_equal "success", response_data["status"]
      assert_equal "2 notification(s) marked as read", response_data["message"]
      assert_equal 2, response_data["marked_count"]

      refute_nil ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_1', user: @user)&.read_at
      refute_nil ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_2', user: @user)&.read_at
    end

    test "mark_as_read creates and updates multiple notifications" do
      yesterday = 1.day.ago
      external_notification1 = create_external_notification(@user, external_id: 'TEST_ENTRY_ID_1', read_at: yesterday)

      patch :mark_as_read, params: {external_notifications: ['TEST_ENTRY_ID_1', 'TEST_ENTRY_ID_2']}
      assert_response :ok

      response_data = JSON.parse(@response.body)
      assert_equal "success", response_data["status"]
      assert_equal "2 notification(s) marked as read", response_data["message"]
      assert_equal 2, response_data["marked_count"]

      external_notification1.reload
      refute_nil ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_1', user: @user)&.read_at
      assert_equal yesterday.to_i, external_notification1.read_at.to_i
      refute_nil ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_2', user: @user)&.read_at
    end

    test "mark_as_read does not update already read external notifications" do
      yesterday = 1.day.ago
      external_notification1 = create_external_notification(@user, external_id: 'TEST_ENTRY_ID_1', read_at: yesterday)

      patch :mark_as_read, params: {external_notifications: ['TEST_ENTRY_ID_1', 'TEST_ENTRY_ID_2']}
      assert_response :ok

      response_data = JSON.parse(@response.body)
      assert_equal "success", response_data["status"]
      assert_equal 2, response_data["marked_count"]

      external_notification1.reload

      assert_equal yesterday.to_i, external_notification1.read_at.to_i
      refute_nil ExternalNotification.find_by(external_id: 'TEST_ENTRY_ID_2', user: @user)&.read_at
    end

    test "mark_as_read returns error for empty notification_ids" do
      patch :mark_as_read, params: {external_notifications: []}
      assert_response :bad_request

      response_data = JSON.parse(@response.body)
      assert_equal "error", response_data["status"]
      assert_equal "No notification IDs provided", response_data["message"]
    end

    test "mark_as_read returns error when no notification_ids param provided" do
      patch :mark_as_read, params: {}
      assert_response :bad_request

      response_data = JSON.parse(@response.body)
      assert_equal "error", response_data["status"]
      assert_equal "No notification IDs provided", response_data["message"]
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
