class CreateUnitGroupsResources < ActiveRecord::Migration[5.2]
  def change
    create_table :unit_groups_resources do |t|
      t.integer :unit_group_id
      t.integer :resource_id

      t.index [:unit_group_id, :resource_id], unique: true
      t.index [:resource_id, :unit_group_id]
    end
    reversible do |dir|
      dir.up do
        execute "ALTER TABLE scripts_resources CONVERT TO CHARACTER SET utf8 COLLATE utf8_unicode_ci"
      end
    end
  end
end
