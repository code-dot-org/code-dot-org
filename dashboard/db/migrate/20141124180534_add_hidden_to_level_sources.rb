class AddHiddenToLevelSources < ActiveRecord::Migration[4.2]
  def change
    add_column :level_sources, :hidden, :boolean, default: false
    # ALTER TABLE `level_sources` ADD `hidden` tinyint(1) DEFAULT 0
    # ALTER TABLE `level_sources` ADD `hidden` tinyint(1) DEFAULT 0
  end
end
