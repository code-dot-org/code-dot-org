module Notifications
  class << self
    def get_all(user_id)
      sources.flat_map {|s| s.get(user_id: user_id)}
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

  Notification = Struct.new(:id, :user_id, :source, :message, keyword_init: true) do
    def initialize(...)
      super
      freeze
    end
  end
end