require 'test_helper'

class NotificationsControllerTest < ActionController::TestCase
  include Devise::Test::ControllerHelpers

  setup do
    @user = create(:user)
    @other_user = create(:user)
    sign_in(@user)
  end

  test "index requires authentication" do
    sign_out(@user)
    get :index
    assert_redirected_to_sign_in
  end

  test "index returns empty array when user has no external notifications" do
    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal [], response_data
  end

  test "index returns user external notifications in descending order by created_at" do
    create_external_notification(@user, external_id: "111", created_at: 2.days.ago)
    create_external_notification(@user, external_id: "222", created_at: 1.day.ago)
    create_external_notification(@user, external_id: "333", created_at: Time.current)

    create_external_notification(@other_user, external_id: "999")

    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal 3, response_data.length

    assert_equal "333", response_data[0]["externalId"]
    assert_equal "222", response_data[1]["externalId"]
    assert_equal "111", response_data[2]["externalId"]
  end

  test "index only returns active external notifications" do
    create_external_notification(@user, external_id: "111")

    create_external_notification(@user, external_id: "222", is_dismissed: true)

    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal 1, response_data.length
    assert_equal "111", response_data[0]["externalId"]
  end

  test "mark_as_read requires authentication" do
    external_notification = create_external_notification(@user)
    sign_out(@user)

    patch :mark_as_read, params: {notification_ids: [external_notification.id]}
    assert_redirected_to_sign_in
  end

  test "mark_as_read successfully marks multiple external notifications as read" do
    external_notification1 = create_external_notification(@user, external_id: "111")
    external_notification2 = create_external_notification(@user, external_id: "222")
    external_notification3 = create_external_notification(@user, external_id: "333")

    assert_nil external_notification1.read_at
    assert_nil external_notification2.read_at
    assert_nil external_notification3.read_at

    patch :mark_as_read, params: {notification_ids: [external_notification1.id, external_notification2.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "2 notification(s) marked as read", response_data["message"]
    assert_equal 2, response_data["marked_count"]

    external_notification1.reload
    external_notification2.reload
    external_notification3.reload

    refute_nil external_notification1.read_at
    refute_nil external_notification2.read_at
    assert_nil external_notification3.read_at
  end

  test "mark_as_read with single external notification" do
    external_notification = create_external_notification(@user)
    assert_nil external_notification.read_at

    patch :mark_as_read, params: {notification_ids: [external_notification.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "1 notification(s) marked as read", response_data["message"]
    assert_equal 1, response_data["marked_count"]

    external_notification.reload
    refute_nil external_notification.read_at
  end

  test "mark_as_read does not update already read external notifications" do
    external_notification1 = create_external_notification(@user)
    external_notification2 = create_external_notification(@user)

    original_read_time = 1.hour.ago
    external_notification1.update!(read_at: original_read_time)

    patch :mark_as_read, params: {notification_ids: [external_notification1.id, external_notification2.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal 2, response_data["marked_count"]

    external_notification1.reload
    external_notification2.reload

    assert_equal original_read_time.to_i, external_notification1.read_at.to_i
    refute_nil external_notification2.read_at
  end

  test "mark_as_read returns error for empty notification_ids" do
    patch :mark_as_read, params: {notification_ids: []}
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

  test "mark_as_read handles mix of valid and invalid notification IDs" do
    external_notification1 = create_external_notification(@user)
    external_notification2 = create_external_notification(@user)
    invalid_id = 999999

    patch :mark_as_read, params: {notification_ids: [external_notification1.id, invalid_id, external_notification2.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "2 notification(s) marked as read", response_data["message"]
    assert_equal 2, response_data["marked_count"]

    external_notification1.reload
    external_notification2.reload
    refute_nil external_notification1.read_at
    refute_nil external_notification2.read_at
  end

  test "mark_as_read ignores other user's external notifications" do
    user_external_notification = create_external_notification(@user)
    other_external_notification = create_external_notification(@other_user)

    patch :mark_as_read, params: {notification_ids: [user_external_notification.id, other_external_notification.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "1 notification(s) marked as read", response_data["message"]
    assert_equal 1, response_data["marked_count"]

    user_external_notification.reload
    other_external_notification.reload
    refute_nil user_external_notification.read_at
    assert_nil other_external_notification.read_at
  end

  test "authorization prevents access to other user external notifications through cancan" do
    create_external_notification(@other_user)

    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal 0, response_data.length
  end

  test "mark_as_read with string IDs converts to integers properly" do
    external_notification1 = create_external_notification(@user)
    external_notification2 = create_external_notification(@user)

    patch :mark_as_read, params: {notification_ids: [external_notification1.id.to_s, external_notification2.id.to_s]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal 2, response_data["marked_count"]

    external_notification1.reload
    external_notification2.reload
    refute_nil external_notification1.read_at
    refute_nil external_notification2.read_at
  end

  test "external notification has correct external_id" do
    external_notification = create_external_notification(@user, external_id: "123")
    assert_equal "123", external_notification.external_id
  end

  test "external notification is_dismissed defaults to false" do
    external_notification = create_external_notification(@user)
    assert_equal false, external_notification.is_dismissed
  end

  test "external notification can be dismissed" do
    external_notification = create_external_notification(@user, is_dismissed: true)
    assert_equal true, external_notification.is_dismissed
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
