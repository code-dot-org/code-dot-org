class RemoveExperimentsFromUnitGroupUnits < ActiveRecord::Migration[6.1]
  def up
    remove_column :course_scripts, :experiment_name
    remove_column :course_scripts, :default_script_id
  end

  def down
  end
end
