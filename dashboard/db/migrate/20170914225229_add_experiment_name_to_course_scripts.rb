class AddExperimentNameToCourseScripts < ActiveRecord::Migration[5.0]
  def change
    add_column :course_scripts, :experiment_name, :string, comment:
      'If present, the SingleTeacherExperiment with this name must be enabled '\
      'in order for a teacher or their students to see this script.'
  end
end
