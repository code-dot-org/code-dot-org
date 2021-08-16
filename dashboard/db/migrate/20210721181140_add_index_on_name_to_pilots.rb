class AddIndexOnNameToPilots < ActiveRecord::Migration[5.2]
  def up
    remove_index :pilots, :name
    add_index :pilots, :name, unique: true
  end

  def down
    remove_index :pilots, :name
    add_index :pilots, :name
  end
end
