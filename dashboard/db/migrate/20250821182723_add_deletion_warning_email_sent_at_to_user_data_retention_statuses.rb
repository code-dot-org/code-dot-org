class AddDeletionWarningEmailSentAtToUserDataRetentionStatuses < ActiveRecord::Migration[6.1]
  def change
    add_column :user_data_retention_statuses, :deletion_warning_email_sent_at, :datetime
  end
end
