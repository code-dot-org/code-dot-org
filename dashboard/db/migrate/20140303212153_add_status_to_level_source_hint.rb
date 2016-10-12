class AddStatusToLevelSourceHint < ActiveRecord::Migration[4.2]
  def change
    add_column :level_source_hints, :status, :string
  end
end
