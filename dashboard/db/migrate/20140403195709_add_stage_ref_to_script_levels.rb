class AddStageRefToScriptLevels < ActiveRecord::Migration[4.2]
  def change
    add_reference :script_levels, :stage, index: true
  end
end
