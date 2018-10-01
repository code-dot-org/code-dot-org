class RemovePdApplicationsDecisionNotificationEmailSentAt < ActiveRecord::Migration[5.0]
  def up
    Pd::Application::ApplicationBase.where.not(decision_notification_email_sent_at: nil).find_each do |application|
      next unless application&.user&.email

      # Create new email records from old application.decision_notification_email_sent_at entries
      Pd::Application::Email.create!(
        application: application,
        application_status: application.status,
        email_type: application.status,
        to: application.user.email,
        created_at: application.decision_notification_email_sent_at,
        sent_at: application.decision_notification_email_sent_at
      )
    end

    remove_column :pd_applications, :decision_notification_email_sent_at
  end

  def down
    add_column :pd_applications, :decision_notification_email_sent_at, :datetime
  end
end
