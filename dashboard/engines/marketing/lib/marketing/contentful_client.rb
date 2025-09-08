require 'singleton'
require 'contentful'

module Marketing
  class ContentfulClient
    include Singleton

    class << self
      delegate :entry, :entries, to: :instance
    end

    def initialize
      @stubbed_entries = {}
      @stubbing_enabled = (Rails.application.config.respond_to?(:stub_contentful_notifications) && Rails.application.config.stub_contentful_notifications) || [:development, :test].include?(rack_env)

      if @stubbing_enabled
        @stubbed_entries['dashboard-notification'] = [STUB_ENTRY_1, STUB_ENTRY_2, STUB_ENTRY_3]
      end

      @client = Contentful::Client.new(
        space: CDO.contentful_space_id,
        access_token: CDO.contentful_api_key,
        api_url: CDO.contentful_hostname
      )
    end

    def entry(locale, id)
      @client.entry(id, locale: locale)
    end

    def entries(locale, content_type_id)
      # We need to stub out Contentful calls in development and test envs in order to enable eyes tests
      if @stubbing_enabled
        @stubbed_entries[content_type_id] || []
      else
        @client.entries(content_type: content_type_id, locale: locale)
      end
    end

    STUB_ENTRY_1 = OpenStruct.new(
      id: 'test_notification_1',
      first_published_at: "2025-09-01T00:00:00Z",
      fields: {
        title: "Test notification no. 1",
        description: "The deepest parts of the ocean are totally unknown to us. No soundings have been able to reach them. What goes on in those distant depths?",
        icon_name: "envelope",
        href_links: [
          {
            'url' => "www.example.com",
            'text' => "20,000 leagues"
          }
        ],
        ai_prompts: [],
        priority: 0,
        expires_at: "2026-08-01T00:00-07:00",
        icon_color: "Purple"
      }
    )

    STUB_ENTRY_2 = OpenStruct.new(
      id: 'test_notification_2',
      first_published_at: "2025-09-05T00:00:00Z",
      fields: {
        title: "Test notification no. 2",
        description: "The town extends along a low and marshy level, between two hills. An immense bed of lava bounds it on one side, and falls gently towards the sea.",
        icon_name: "star",
        href_links: [],
        ai_prompts: [
          {
            'text' => "Journey to the center of the earth",
            'prompt' => "How do you get to the center of AI?"
          }
        ],
        priority: 0,
        expires_at: "2026-08-01T00:00-07:00",
        icon_color: "Aqua"
      }
    )

    STUB_ENTRY_3 = OpenStruct.new(
      id: 'expired_notification',
      first_published_at: "2025-09-01T00:00:00Z",
      fields: {
        title: "EXPIRED NOTIFICATION",
        description: "Should not show up",
        icon_name: "envelope",
        priority: 0,
        expires_at: "2025-08-16T00:00-07:00"
      }
    )
  end
end
