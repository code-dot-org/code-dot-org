class TeacherNotificationSource < Notifications::Source
  def get(user_id:, locale:)
    TeacherNotification.active.where(user_id: user_id).map do |notification|
      TeacherNotificationUtils.teacher_notification_to_notification(notification)
    end
  end
end
