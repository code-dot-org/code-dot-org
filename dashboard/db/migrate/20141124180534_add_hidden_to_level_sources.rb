class AddHiddenToLevelSources < ActiveRecord::Migration
  def change
    add_column :level_sources, :hidden, :boolean, default: false
<<<<<<< HEAD
    # ALTER TABLE `level_sources` ADD `hidden` tinyint(1) DEFAULT 0
=======
>>>>>>> hide-level-source
  end
end
