class TeacherNotificationSource < Notifications::Source
  SOURCE_NAME = 'teacher_notification'

  def get(user_id:, locale:)
    TeacherNotification.active.where(user_id: user_id).map do |notification|
      {
        id: notification.id,
        source: SOURCE_NAME,
        external_id: nil, # external ID is only used for contentful notifications
        title: notification.title,
        description: notification.description,
        icon_name: notification.icon_name,
        icon_color: notification.icon_color,
        href_links: notification.href_links,
        ai_prompts: notification.ai_prompts,
        priority: notification.priority,
        published_at: notification.created_at.iso8601,
        expires_at: notification.expires_at&.iso8601,
        read_at: notification.read_at&.iso8601
      }
    end
  end
end
