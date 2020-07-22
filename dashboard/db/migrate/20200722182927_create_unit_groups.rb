class CreateUnitGroups < ActiveRecord::Migration[5.0]
  def up
    execute 'CREATE TABLE unit_groups LIKE courses'
    execute 'INSERT INTO unit_groups SELECT * FROM courses'

    # fix the name of the index
    remove_index :unit_groups, :name
    add_index :unit_groups, :name
  end

  def down
    drop_table :unit_groups
  end
end
