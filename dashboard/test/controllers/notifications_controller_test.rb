require 'test_helper'
require 'contentful'

class NotificationsControllerTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks
  TestEntry = Struct.new(:external_id, :title, :description, :icon_name, :href_links, :ai_prompts, :priority, :published_at, :expires_at, :read_at, :source, keyword_init: true)

  let(:entry_id_1) {SecureRandom.hex(10).to_s}
  let(:entry_id_2) {SecureRandom.hex(10).to_s}
  let(:yesterday) {1.day.ago.iso8601}
  let(:today) {Time.now.iso8601}
  let(:tomorrow) {1.day.from_now.iso8601}
  let(:later) {2.days.from_now.iso8601}
  let(:user) {create(:user)}
  let(:other_user) {create(:user)}

  let(:teacher_notification_1) do
    create(:teacher_notification,
      user: user,
      title: 'Teacher Notification 1',
      description: 'Teacher Description 1',
      icon_name: 'teacher_icon1',
      icon_color: 'blue',
      href_links: [{'url' => 'https://teacher.example.com/1', 'text' => 'Teacher Link 1'}],
      ai_prompts: [{'text' => 'Teacher Prompt 1', 'prompt' => 'Teacher Prompt 1 text'}],
      priority: 1,
      expires_at: 1.day.from_now,
      read_at: nil
    )
  end

  let(:teacher_notification_2) do
    create(:teacher_notification,
      user: user,
      title: 'Teacher Notification 2',
      description: 'Teacher Description 2',
      icon_name: 'teacher_icon2',
      icon_color: 'red',
      href_links: [{'url' => 'https://teacher.example.com/2', 'text' => 'Teacher Link 2'}],
      ai_prompts: [{'text' => 'Teacher Prompt 2', 'prompt' => 'Teacher Prompt 2 text'}],
      priority: 2,
      expires_at: 2.days.from_now,
      read_at: Time.current
    )
  end

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
      read_at: today,
      source: 'contentful'
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
      read_at: nil,
      source: 'contentful'
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
        Notifications.stubs(:get_all).returns([entry_1, entry_2])
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

      it 'returns user teacher notifications only' do
        teacher_notification_data_1 = {
          id: teacher_notification_1.id,
          source: 'teacher_notification',
          external_id: nil,
          title: 'Teacher Notification 1',
          description: 'Teacher Description 1',
          icon_name: 'teacher_icon1',
          icon_color: 'blue',
          href_links: [{'url' => 'https://teacher.example.com/1', 'text' => 'Teacher Link 1'}],
          ai_prompts: [{'text' => 'Teacher Prompt 1', 'prompt' => 'Teacher Prompt 1 text'}],
          priority: 1,
          published_at: teacher_notification_1.created_at.iso8601,
          expires_at: teacher_notification_1.expires_at&.iso8601,
          read_at: nil
        }

        teacher_notification_data_2 = {
          id: teacher_notification_2.id,
          source: 'teacher_notification',
          external_id: nil,
          title: 'Teacher Notification 2',
          description: 'Teacher Description 2',
          icon_name: 'teacher_icon2',
          icon_color: 'red',
          href_links: [{'url' => 'https://teacher.example.com/2', 'text' => 'Teacher Link 2'}],
          ai_prompts: [{'text' => 'Teacher Prompt 2', 'prompt' => 'Teacher Prompt 2 text'}],
          priority: 2,
          published_at: teacher_notification_2.created_at.iso8601,
          expires_at: teacher_notification_2.expires_at&.iso8601,
          read_at: teacher_notification_2.read_at&.iso8601
        }

        Notifications.stubs(:get_all).returns([teacher_notification_data_1, teacher_notification_data_2])
        get '/notifications'

        assert_response :success

        response_data = JSON.parse(@response.body)
        _(response_data.length).must_equal 2

        _(response_data[0]).wont_be_nil
        _(response_data[0]["id"]).must_equal teacher_notification_1.id
        _(response_data[0]["source"]).must_equal 'teacher_notification'
        _(response_data[0]["title"]).must_equal 'Teacher Notification 1'
        _(response_data[0]["description"]).must_equal 'Teacher Description 1'
        _(response_data[0]["iconName"]).must_equal 'teacher_icon1'
        _(response_data[0]["iconColor"]).must_equal 'blue'
        _(response_data[0]["hrefLinks"]).must_equal [{'url' => 'https://teacher.example.com/1', 'text' => 'Teacher Link 1'}]
        _(response_data[0]["aiPrompts"]).must_equal [{'text' => 'Teacher Prompt 1', 'prompt' => 'Teacher Prompt 1 text'}]
        _(response_data[0]["priority"]).must_equal 1
        _(response_data[0]["readAt"]).must_be_nil

        _(response_data[1]).wont_be_nil
        _(response_data[1]["id"]).must_equal teacher_notification_2.id
        _(response_data[1]["readAt"]).wont_be_nil
      end

      it 'returns both external and teacher notifications combined' do
        # Stub to return both external and teacher notifications
        teacher_notification_data_1 = {
          id: teacher_notification_1.id,
          source: 'teacher_notification',
          external_id: nil,
          title: 'Teacher Notification 1',
          description: 'Teacher Description 1',
          icon_name: 'teacher_icon1',
          icon_color: 'blue',
          href_links: [{'url' => 'https://teacher.example.com/1', 'text' => 'Teacher Link 1'}],
          ai_prompts: [{'text' => 'Teacher Prompt 1', 'prompt' => 'Teacher Prompt 1 text'}],
          priority: 1,
          published_at: teacher_notification_1.created_at.iso8601,
          expires_at: teacher_notification_1.expires_at&.iso8601,
          read_at: nil
        }

        Notifications.stubs(:get_all).returns([entry_1, teacher_notification_data_1])
        get '/notifications'

        assert_response :success

        response_data = JSON.parse(@response.body)
        _(response_data.length).must_equal 2

        external_notification = response_data.find {|n| n["externalId"] == entry_id_1}
        teacher_notification = response_data.find {|n| n["title"] == 'Teacher Notification 1'}

        _(external_notification).wont_be_nil
        _(external_notification["externalId"]).must_equal entry_id_1
        _(external_notification["title"]).must_equal 'Notification 1'
        _(external_notification["source"]).must_equal 'contentful'

        _(teacher_notification).wont_be_nil
        _(teacher_notification["id"]).must_equal teacher_notification_1.id
        _(teacher_notification["title"]).must_equal 'Teacher Notification 1'
        _(teacher_notification["source"]).must_equal 'teacher_notification'
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
        Notifications.stubs(:get_all).returns([entry_1, entry_2])

        post '/notifications/mark_as_read', params: {external_notification_ids: [entry_1.external_id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "1 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 1

        _(ExternalNotification.find_by(external_id: entry_1.external_id, user: user)&.read_at).wont_be_nil
      end

      it 'successfully creates a record and marks external notifications for multiple notifications' do
        Notifications.stubs(:get_all).returns([entry_1, entry_2])

        post '/notifications/mark_as_read', params: {external_notification_ids: [entry_1.external_id, entry_2.external_id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "2 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 2

        _(ExternalNotification.find_by(external_id: entry_1.external_id, user: user)&.read_at).wont_be_nil
        _(ExternalNotification.find_by(external_id: entry_2.external_id, user: user)&.read_at).wont_be_nil
      end

      it 'creates and updates multiple notifications' do
        Notifications.stubs(:get_all).returns([entry_1, entry_2])

        yesterday = 1.day.ago
        external_notification1 = create_external_notification(user, external_id: entry_1.external_id, read_at: yesterday)

        post '/notifications/mark_as_read', params: {external_notification_ids: [entry_1.external_id, entry_2.external_id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "2 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 2

        external_notification1.reload
        _(ExternalNotification.find_by(external_id: entry_1.external_id, user: user)&.read_at).wont_be_nil
        _(external_notification1.read_at.to_i).must_equal yesterday.to_i
        _(ExternalNotification.find_by(external_id: entry_2.external_id, user: user)&.read_at).wont_be_nil
      end

      it 'does not update already read external notifications' do
        Notifications.stubs(:get_all).returns([entry_1, entry_2])
        yesterday = 1.day.ago
        external_notification1 = create_external_notification(user, external_id: entry_1.external_id, read_at: yesterday)

        post '/notifications/mark_as_read', params: {external_notification_ids: [entry_1.external_id, entry_2.external_id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["marked_count"]).must_equal 2

        external_notification1.reload

        _(external_notification1.read_at.to_i).must_equal yesterday.to_i
        _(ExternalNotification.find_by(external_id: entry_2.external_id, user: user)&.read_at).wont_be_nil
      end

      it 'successfully marks teacher notifications as read' do
        teacher_notification_1
        teacher_notification_2

        post '/notifications/mark_as_read', params: {teacher_notification_ids: [teacher_notification_1.id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "1 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 1

        teacher_notification_1.reload
        _(teacher_notification_1.read_at).wont_be_nil
      end

      it 'successfully marks multiple teacher notifications as read' do
        teacher_notification_1
        teacher_notification_2.update!(read_at: nil)

        post '/notifications/mark_as_read', params: {teacher_notification_ids: [teacher_notification_1.id, teacher_notification_2.id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "2 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 2

        teacher_notification_1.reload
        teacher_notification_2.reload
        _(teacher_notification_1.read_at).wont_be_nil
        _(teacher_notification_2.read_at).wont_be_nil
      end

      it 'does not update already read teacher notifications' do
        teacher_notification_1
        teacher_notification_2

        notification_2_read_at = teacher_notification_2['read_at']

        post '/notifications/mark_as_read', params: {teacher_notification_ids: [teacher_notification_1.id, teacher_notification_2.id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "1 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 1

        teacher_notification_1.reload
        teacher_notification_2.reload
        _(teacher_notification_1.read_at).wont_be_nil
        _(teacher_notification_2.read_at.to_i).must_equal notification_2_read_at.to_i
      end

      it 'successfully marks both external and teacher notifications as read' do
        Notifications.stubs(:get_all).returns([entry_1])
        teacher_notification_1

        post '/notifications/mark_as_read', params: {
          external_notification_ids: [entry_1.external_id],
          teacher_notification_ids: [teacher_notification_1.id]
        }
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["message"]).must_equal "2 notification(s) marked as read"
        _(response_data["marked_count"]).must_equal 2

        _(ExternalNotification.find_by(external_id: entry_1.external_id, user: user)&.read_at).wont_be_nil
        teacher_notification_1.reload
        _(teacher_notification_1.read_at).wont_be_nil
      end

      it 'does not update teacher notifications for other users' do
        other_teacher_notification = create(:teacher_notification, user: other_user, read_at: nil)

        post '/notifications/mark_as_read', params: {teacher_notification_ids: [other_teacher_notification.id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["marked_count"]).must_equal 0

        other_teacher_notification.reload
        _(other_teacher_notification.read_at).must_be_nil
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

      it 'does not update if notification does not exist for user' do
        Notifications.stubs(:get_all).returns([])

        post '/notifications/mark_as_read', params: {external_notification_ids: [entry_1.external_id]}
        assert_response :ok

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "success"
        _(response_data["marked_count"]).must_equal 0
      end

      it 'returns error for empty teacher notification_ids' do
        post '/notifications/mark_as_read', params: {teacher_notification_ids: []}
        assert_response :bad_request

        response_data = JSON.parse(@response.body)
        _(response_data["status"]).must_equal "error"
        _(response_data["message"]).must_equal "No notification IDs provided"
      end

      it 'returns error for empty both external and teacher notification_ids' do
        post '/notifications/mark_as_read', params: {external_notification_ids: [], teacher_notification_ids: []}
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
