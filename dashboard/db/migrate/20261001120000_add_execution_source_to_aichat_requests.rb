class AddExecutionSourceToAichatRequests < ActiveRecord::Migration[7.0]
  # Nullable with no default: a row predating this migration has no answer, and
  # NULL has to stay distinguishable from GATEWAY so AichatEventsController can
  # keep its old behavior for those rows rather than assume one. Rows age out
  # after 91 days via bin/cron/delete_old_ai_chat_data.
  def change
    add_column :aichat_requests, :execution_source, :integer
  end
end
