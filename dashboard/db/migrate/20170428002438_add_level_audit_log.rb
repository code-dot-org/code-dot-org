class AddLevelAuditLog < ActiveRecord::Migration[5.0]
  def change
    add_column :levels, :audit_log, :text
  end
end
