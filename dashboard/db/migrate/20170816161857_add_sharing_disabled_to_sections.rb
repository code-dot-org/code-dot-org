class AddSharingDisabledToSections < ActiveRecord::Migration[5.0]
  def change
    add_column :sections, :sharing_disabled, :boolean, null: false, default: false, comment:
      'Flag indicates the default sharing setting for a section and is used to '\
      'determine students share setting when adding a new student to the section.'
  end
end
