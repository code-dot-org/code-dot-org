class TeacherNotificationChannel < ApplicationCable::Channel
  def subscribed
    pp 'lfm subscribed to teacher notification channel', "teacher-notifications-#{current_user.id}"
    stream_from "teacher-notifications-#{current_user.id}"
  end

  def self.send_notification(user_id, notification)
    pp 'lfm sending notification', "teacher-notifications-#{user_id}"
    ActionCable.server.broadcast(
      "teacher-notifications-#{user_id}",
      {
        type: 'new_notification',
        notification: TeacherNotificationUtils.teacher_notification_to_notification(notification).as_json
      }
    )
  end
end
