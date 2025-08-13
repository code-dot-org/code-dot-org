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

  test "index returns empty array when user has no notifications" do
    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal [], response_data
  end

  test "index returns user notifications in descending order by created_at" do
    create_notification(@user, title: "First notification", created_at: 2.days.ago)
    create_notification(@user, title: "Second notification", created_at: 1.day.ago)
    create_notification(@user, title: "Third notification", created_at: Time.current)

    create_notification(@other_user, title: "Other user notification")

    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal 3, response_data.length

    assert_equal "Third notification", response_data[0]["title"]
    assert_equal "Second notification", response_data[1]["title"]
    assert_equal "First notification", response_data[2]["title"]
  end

  test "index only returns active notifications" do
    create_notification(@user, title: "Active notification")

    create_notification(@user, title: "Dismissed notification", is_dismissed: true)

    create_notification(@user, title: "Expired notification", expires_at: 1.day.ago)

    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal 1, response_data.length
    assert_equal "Active notification", response_data[0]["title"]
  end

  test "mark_as_read requires authentication" do
    notification = create_notification(@user)
    sign_out(@user)

    patch :mark_as_read, params: {notification_ids: [notification.id]}
    assert_redirected_to_sign_in
  end

  test "mark_as_read successfully marks multiple notifications as read" do
    notification1 = create_notification(@user, title: "First")
    notification2 = create_notification(@user, title: "Second")
    notification3 = create_notification(@user, title: "Third")

    assert_nil notification1.read_at
    assert_nil notification2.read_at
    assert_nil notification3.read_at

    patch :mark_as_read, params: {notification_ids: [notification1.id, notification2.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "2 notification(s) marked as read", response_data["message"]
    assert_equal 2, response_data["marked_count"]

    notification1.reload
    notification2.reload
    notification3.reload

    refute_nil notification1.read_at
    refute_nil notification2.read_at
    assert_nil notification3.read_at
  end

  test "mark_as_read with single notification" do
    notification = create_notification(@user)
    assert_nil notification.read_at

    patch :mark_as_read, params: {notification_ids: [notification.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "1 notification(s) marked as read", response_data["message"]
    assert_equal 1, response_data["marked_count"]

    notification.reload
    refute_nil notification.read_at
  end

  test "mark_as_read does not update already read notifications" do
    notification1 = create_notification(@user)
    notification2 = create_notification(@user)

    original_read_time = 1.hour.ago
    notification1.update!(read_at: original_read_time)

    patch :mark_as_read, params: {notification_ids: [notification1.id, notification2.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal 2, response_data["marked_count"]

    notification1.reload
    notification2.reload

    assert_equal original_read_time.to_i, notification1.read_at.to_i
    refute_nil notification2.read_at
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
    notification1 = create_notification(@user)
    notification2 = create_notification(@user)
    invalid_id = 999999

    patch :mark_as_read, params: {notification_ids: [notification1.id, invalid_id, notification2.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "2 notification(s) marked as read", response_data["message"]
    assert_equal 2, response_data["marked_count"]

    notification1.reload
    notification2.reload
    refute_nil notification1.read_at
    refute_nil notification2.read_at
  end

  test "mark_as_read ignores other user's notifications" do
    user_notification = create_notification(@user)
    other_notification = create_notification(@other_user)

    patch :mark_as_read, params: {notification_ids: [user_notification.id, other_notification.id]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal "1 notification(s) marked as read", response_data["message"]
    assert_equal 1, response_data["marked_count"]

    user_notification.reload
    other_notification.reload
    refute_nil user_notification.read_at
    assert_nil other_notification.read_at
  end

  test "authorization prevents access to other user notifications through cancan" do
    # This test ensures that the load_and_authorize_resource works correctly
    create_notification(@other_user)

    # Try to access index - should only return current user's notifications
    get :index
    assert_response :success

    response_data = JSON.parse(@response.body)
    assert_equal 0, response_data.length
  end

  test "mark_as_read with string IDs converts to integers properly" do
    notification1 = create_notification(@user)
    notification2 = create_notification(@user)

    # Pass string IDs (as would come from a web form)
    patch :mark_as_read, params: {notification_ids: [notification1.id.to_s, notification2.id.to_s]}
    assert_response :ok

    response_data = JSON.parse(@response.body)
    assert_equal "success", response_data["status"]
    assert_equal 2, response_data["marked_count"]

    notification1.reload
    notification2.reload
    refute_nil notification1.read_at
    refute_nil notification2.read_at
  end

  private def create_notification(user, attributes = {})
    default_attributes = {
      user: user,
      title: "Test notification",
      priority: 0,
      is_dismissed: false
    }

    Notification.create!(default_attributes.merge(attributes))
  end
end
