class AddStatusToLevelSourceHint < ActiveRecord::Migration
  def change
    add_column :level_source_hints, :status, :string
  end
end
