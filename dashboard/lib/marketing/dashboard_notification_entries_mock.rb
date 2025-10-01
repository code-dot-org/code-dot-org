# frozen_string_literal: true

# This is a mocked version of the ContentfulClient used in development and test environments
module Marketing
  module DashboardNotificationEntriesMock
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

    ENTRIES = [STUB_ENTRY_1, STUB_ENTRY_2, STUB_ENTRY_3].freeze

    def self.find_each(**, &block)
      ENTRIES.each(&block)
      ENTRIES.size
    end
  end
end
