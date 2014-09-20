class AddSolutionToLevels < ActiveRecord::Migration
  def change
    add_column :levels, :solution_level_source_id, :integer
  end
end
