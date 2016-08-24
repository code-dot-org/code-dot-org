class AddUserIdToLevelSourceHints < ActiveRecord::Migration[4.2]
  def change
    add_column :level_source_hints, :user_id, :integer
  end
end
