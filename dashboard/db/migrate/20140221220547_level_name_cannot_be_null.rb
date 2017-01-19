class LevelNameCannotBeNull < ActiveRecord::Migration[4.2]
  def change
    execute "update levels set name = '' where name is NULL"
    change_column :levels, :name, :string, null: false
  end
end
