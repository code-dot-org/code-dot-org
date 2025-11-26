module Notifications
  class << self
    def get_all(user_id, locale)
      sources.flat_map {|s| s.get(user_id: user_id, locale: locale)}.map {|n| Notification.new(n)}
    end

    def register(source)
      registry << source unless registry.include?(source)
    end

    private def sources
      registry
    end

    private def registry
      @registry ||= []
    end
  end

  Notification = Struct.new(:id, :source, :external_id, :title, :description, :icon_name, :icon_color, :href_links, :ai_prompts, :priority, :published_at, :expires_at, :read_at, keyword_init: true) do
    def initialize(...)
      super
      freeze
    end
  end
end
