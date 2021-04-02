class CreateUnitGroupsStudentResources < ActiveRecord::Migration[5.2]
  def change
    create_table :unit_groups_student_resources do |t|
      t.integer :unit_group_id
      t.integer :resource_id

      # The index names Rails gives are too long, so shorten them a bit
      t.index [:unit_group_id, :resource_id], unique: true, name: 'index_ug_student_resources_on_unit_group_id_and_resource_id'
      t.index [:resource_id, :unit_group_id], name: 'index_ug_student_resources_on_resource_id_and_unit_group_id'
    end

    reversible do |dir|
      dir.up do
        execute "ALTER TABLE unit_groups_student_resources CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
