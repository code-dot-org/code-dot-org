class AddSolutionToLevels < ActiveRecord::Migration[4.2]
  def change
    add_column :levels, :solution_level_source_id, :integer
  end
end
