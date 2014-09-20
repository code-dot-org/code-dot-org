class AddSourceToLevelSourceHints < ActiveRecord::Migration
  def change
    add_column :level_source_hints, :source, :string
  end
end
