class AddUserIdToLevelSourceHints < ActiveRecord::Migration
  def change
    add_column :level_source_hints, :user_id, :integer
  end
end
