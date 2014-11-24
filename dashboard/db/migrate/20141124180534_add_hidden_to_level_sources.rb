class AddHiddenToLevelSources < ActiveRecord::Migration
  def change
    add_column :level_sources, :hidden, :boolean, default: false
  end
end
