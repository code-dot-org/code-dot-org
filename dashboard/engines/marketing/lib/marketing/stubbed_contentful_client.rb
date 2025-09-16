require 'singleton'
require 'contentful'

# This is a mocked version of the ContentfulClient used in development and test environments
module Marketing
  class StubbedContentfulClient
    include Singleton

    class << self
      delegate :entry, :entries, to: :instance
    end

    def initialize
      @stubbed_entries = {}
      @stubbed_entries['dashboard-notification'] = [STUB_ENTRY_1, STUB_ENTRY_2, STUB_ENTRY_3]
    end

    # Pass through to the real client.
    def entry(locale, id)
      Marketing::ContentfulClient.entry(locale, id)
    end

    # We currently only stub out the entries method for `dashboard-notification` content type.
    def entries(locale, content_type_id)
      if @stubbed_entries[content_type_id].present?
        @stubbed_entries[content_type_id] || []
      else
        Marketing::ContentfulClient.entries(content_type: content_type_id, locale: locale)
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
            'url' => "https://www.example.com",
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
