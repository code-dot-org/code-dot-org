class ChangeAidiffTableNames < ActiveRecord::Migration[6.1]
  def change
    rename_table :aichat_messages, :aidiff_messages
    rename_table :aichat_message_feedbacks, :aidiff_message_feedbacks
    rename_table :aichat_threads, :aidiff_threads
    rename_column :aidiff_messages, :aichat_thread_id, :aidiff_thread_id
    rename_column :aidiff_message_feedbacks, :aichat_message_id, :aidiff_message_id
  end
end
