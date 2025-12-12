class TeacherNotificationChannel < ApplicationCable::Channel
  def subscribed
    stream_from "teacher-notifications-#{current_user.id}"
  end

  def self.send_notification(user_id, notification)
    ActionCable.server.broadcast(
      "teacher-notifications-#{user_id}",
      {
        type: 'new_notification',
        notification: TeacherNotificationUtils.teacher_notification_to_notification(notification).as_json
      }
    )
  end
end
