class IndexAndAllowNullIndexedAtForUserGeos < ActiveRecord::Migration[4.2]
  def up
    change_column_null :user_geos, :indexed_at, true
    change_column_default :user_geos, :indexed_at, nil
    add_index :user_geos, :indexed_at
  end

  def down
    remove_index :user_geos, :indexed_at
  end
end
