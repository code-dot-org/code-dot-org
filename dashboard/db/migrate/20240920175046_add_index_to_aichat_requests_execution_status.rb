class AddIndexToAichatRequestsExecutionStatus < ActiveRecord::Migration[6.1]
  def change
    add_index :aichat_requests, :execution_status
  end
end
