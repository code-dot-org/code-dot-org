class AddIndexToScripts < ActiveRecord::Migration
  def change
    add_index :scripts, :name, unique: true
    # 'change_column_null' is not reversible prior to Rails 4.1.0: https://github.com/rails/rails/issues/13576
    change_column :scripts, :name, :string, :null => false
  end
end
