module Notifications
  class << self
    def get_all(user_id, locale)
      sources.flat_map {|s| s.get(user_id: user_id, locale: locale)}
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

  # Todo: change types
  Notification = Struct.new(:id, :user_id, :source, :message, keyword_init: true) do
    def initialize(...)
      super
      freeze
    end
  end
end
