class AddDecisionNotificationEmailSentAtToPdApplication < ActiveRecord::Migration[5.0]
  def change
    add_column :pd_applications, :decision_notification_email_sent_at, :datetime
  end
end
