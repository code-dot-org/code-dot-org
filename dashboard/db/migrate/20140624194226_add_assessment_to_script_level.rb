class AddAssessmentToScriptLevel < ActiveRecord::Migration
  def change
    add_column :script_levels, :assessment, :boolean
  end
end
