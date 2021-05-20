class AddKeyScriptIndexToLessons < ActiveRecord::Migration[5.0]
  def change
    change_column :stages, :key, :string, null: false
    remove_index :stages, :script_id
    add_index :stages, [:script_id, :key], unique: true
  end
end
