class AddDefaultScriptIdToCourseScripts < ActiveRecord::Migration[5.0]
  def change
    add_column :course_scripts, :default_script_id, :integer, comment:
      'If present, indicates the default script which this script will '\
      'replace when the corresponding experiment is enabled. Should be '\
      'null for default scripts (those that show up without experiments).'
    add_index :course_scripts, :default_script_id
  end
end
