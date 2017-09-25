class RemoveSolutionLevelSourceIdFromLevels < ActiveRecord::Migration[5.0]
  def change
    remove_column :levels, :solution_level_source_id, :integer
  end
end
