class DropActivityHint < ActiveRecord::Migration[5.0]
  def up
    # Since we do not recreate the table on rollback, we conditionally drop on
    # its existence.
    drop_table :activity_hints if ActiveRecord::Base.connection.data_source_exists? :activity_hints
  end
end
