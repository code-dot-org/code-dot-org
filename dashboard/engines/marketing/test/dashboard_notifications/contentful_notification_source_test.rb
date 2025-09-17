require 'test_helper'
require 'contentful'
require_relative '../../lib/marketing/dashboard_notifications/contentful_notification_source'

class ContentfulNotificationSourceTest < ActionDispatch::IntegrationTest
  include Minitest::RSpecMocks

  TestEntry = Struct.new(:id, :content_type, :first_published_at, :fields, keyword_init: true)

  let(:entry_id_1) {SecureRandom.hex(10)}
  let(:entry_id_2) {SecureRandom.hex(10)}
  let(:yesterday) {1.day.ago}
  let(:tomorrow) {1.day.from_now}
  let(:later) {2.days.from_now}
  let(:user) {create(:user)}
  let(:other_user) {create(:user)}
  let(:marketing_contentful_client_mock) {stub(:marketing_contentful_client)}
  let!(:contentful_source) {Marketing::DashboardNotifications::ContentfulNotificationSource.new(marketing_contentful_client_mock)}

  let(:entry_1) do
    TestEntry.new(
      content_type: 'dashboard-notification',
      id: entry_id_1,
      first_published_at: yesterday.to_s,
      fields: {
        title: 'Notification 1',
        description: 'Description 1',
        icon_name: 'icon1',
        href_links: [{'url' => 'https://example.com/1', 'text' => 'Link 1'}],
        ai_prompts: [{'text' => 'Prompt 1', 'prompt' => 'Prompt 1 text'}],
        priority: 0,
        expires_at: tomorrow.to_s,
      },
    )
  end

  let(:entry_2) do
    TestEntry.new(
      content_type: 'dashboard-notification',
      id: entry_id_2,
      first_published_at: yesterday.to_s,
      fields: {
        title: 'Notification 2',
        description: 'Description 2',
        icon_name: 'icon1',
        href_links: [{'url' => 'https://example.com/2', 'text' => 'Link 2'}],
        ai_prompts: [{'text' => 'Prompt 2', 'prompt' => 'Prompt 2 text'}],
        priority: 0,
        expires_at: later.to_s,
      },
    )
  end

  before do
    Marketing::ContentfulClient.stubs(:instance).returns(marketing_contentful_client_mock)
    CDO.shared_cache.clear
    sign_in user
  end

  describe 'get_contentful_notifications_for_user' do
    context 'with contentful data' do
      it 'returns user external notifications' do
        marketing_contentful_client_mock.expects(:entries).with('en-US', 'dashboard-notification').returns([entry_1, entry_2]).once

        results = contentful_source.get(user_id: user.id, locale: 'en-US')

        _(results.length).must_equal 2

        _(results[0][:external_id]).must_equal entry_id_1
        _(results[0][:title]).must_equal 'Notification 1'
        _(results[0][:description]).must_equal 'Description 1'
        _(results[0][:icon_name]).must_equal 'icon1'
        _(results[0][:href_links]).must_equal [{:url => 'https://example.com/1', :text => 'Link 1'}]
        _(results[0][:ai_prompts]).must_equal [{:text => 'Prompt 1', :prompt => 'Prompt 1 text'}]
        _(results[0][:priority]).must_equal 0
        _(results[0][:published_at]).must_equal yesterday.iso8601
        _(results[0][:expires_at]).must_equal tomorrow.iso8601

        _(results[1][:external_id]).must_equal entry_id_2
      end

      it 'only returns active external notifications' do
        create_external_notification(user, external_id: entry_id_2, is_dismissed: true)
        marketing_contentful_client_mock.expects(:entries).with('other-locale', 'dashboard-notification').returns([entry_1, entry_2]).once

        results = contentful_source.get(user_id: user.id, locale: 'other-locale')

        _(results.length).must_equal 1
        _(results[0][:external_id]).must_equal entry_id_1
      end

      it 'adds read_at timestamps' do
        marketing_contentful_client_mock.expects(:entries).with('en-US', 'dashboard-notification').returns([entry_1, entry_2]).once

        create_external_notification(user, external_id: entry_id_1, read_at: tomorrow)
        create_external_notification(user, external_id: entry_id_2, read_at: later)

        results = contentful_source.get(user_id: user.id, locale: 'en-US')

        _(results.length).must_equal 2
        _(results[0][:external_id]).must_equal entry_id_1
        _(results[0][:read_at]).must_equal tomorrow.iso8601

        _(results[1][:external_id]).must_equal entry_id_2
        _(results[1][:read_at]).must_equal later.iso8601
      end

      it 'does not return expired notifications' do
        expired_entry = TestEntry.new(
          content_type: 'dashboard-notification',
          id: SecureRandom.hex(10),
          fields: {
            title: 'Expired Notification',
            description: 'This notification has expired',
            icon_name: 'icon_expired',
            href_links: [{'url' => 'https://example.com/expired', 'text' => 'Expired Link'}],
            priority: 0,
            expires_at: 1.day.ago,
          },
          )

        marketing_contentful_client_mock.expects(:entries).with('en-US', 'dashboard-notification').returns([expired_entry]).once

        results = contentful_source.get(user_id: user.id, locale: 'en-US')

        _(results.length).must_equal 0
      end

      it 'caches contentful entries for 2 hours per locale' do
        marketing_contentful_client_mock.expects(:entries).with('en-US', 'dashboard-notification').returns([entry_1]).once

        results1 = contentful_source.get(user_id: user.id, locale: 'en-US')
        _(results1.length).must_equal 1

        results2 = contentful_source.get(user_id: user.id, locale: 'en-US')
        _(results2.length).must_equal 1
      end

      it 'uses separate cache keys for different locales' do
        marketing_contentful_client_mock.expects(:entries).with('en-US', 'dashboard-notification').returns([entry_1]).once
        marketing_contentful_client_mock.expects(:entries).with('es-ES', 'dashboard-notification').returns([entry_2]).once

        results_en = contentful_source.get(user_id: user.id, locale: 'en-US')
        results_es = contentful_source.get(user_id: user.id, locale: 'es-ES')

        _(results_en.length).must_equal 1
        _(results_es.length).must_equal 1
        _(results_en[0][:external_id]).must_equal entry_id_1
        _(results_es[0][:external_id]).must_equal entry_id_2
      end

      it 'cache expires after 1 hour' do
        marketing_contentful_client_mock.expects(:entries).with('en-US', 'dashboard-notification').returns([entry_1]).once
        results1 = contentful_source.get(user_id: user.id, locale: 'en-US')
        _(results1.length).must_equal 1

        travel 2.hours do
          marketing_contentful_client_mock.expects(:entries).with('en-US', 'dashboard-notification').returns([entry_2]).once
          results2 = contentful_source.get(user_id: user.id, locale: 'en-US')
          _(results2.length).must_equal 1
          _(results2[0][:external_id]).must_equal entry_id_2
        end
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
