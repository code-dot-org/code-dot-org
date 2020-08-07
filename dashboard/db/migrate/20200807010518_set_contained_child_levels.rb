class SetContainedChildLevels < ActiveRecord::Migration[5.0]
  def up
    Blockly.all.each do |level|
      level.update_contained_levels
      level.update_contained_child_levels
    end
  end

  def down
  end
end
