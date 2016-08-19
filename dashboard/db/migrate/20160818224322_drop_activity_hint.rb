class DropActivityHint < ActiveRecord::Migration
  def up
    drop_table :activity_hints if ActiveRecord::Base.connection.table_exists? :activity_hints
  end
end
