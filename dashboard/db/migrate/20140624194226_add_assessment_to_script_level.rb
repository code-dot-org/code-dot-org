class AddAssessmentToScriptLevel < ActiveRecord::Migration[4.2]
  def change
    add_column :script_levels, :assessment, :boolean
  end
end
