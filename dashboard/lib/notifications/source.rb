module Notifications
  class Source
    def get(user_id)
      raise NotImplementedError, "#{self.class} must implement the get method"
    end
  end
end