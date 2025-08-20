module Marketing
  module Notifications
    class ContentfulSource < ::Notifications::Source
      def get(user_id:)
        # Real implementation would actually call Contentful
        [::Notifications::Notification.new(
          id: 1,
          user_id: user_id,
          source: self.class.name,
          message: "This is a Contentful notification"
        )]
      end
    end
  end
end