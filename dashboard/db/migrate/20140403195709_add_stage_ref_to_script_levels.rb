class AddStageRefToScriptLevels < ActiveRecord::Migration
  def change
    add_reference :script_levels, :stage, index: true
  end
end
