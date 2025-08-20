class InternalNotificationsSource < Notifications::Source
  def get(user_id:)
    notifications = []
    ::Notification.where(user_id: user_id).find_each do |notification|
      notifications << Notifications::Notification.new(
        id: notification.id,
        user_id: notification.user_id,
        source: self.class.name,
        message: notification.message
      )
    end
    notifications
  end
end