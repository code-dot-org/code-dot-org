class AddPublishedColumnToLevels < ActiveRecord::Migration[4.2]
  def up
    add_column :levels, :published, :boolean, default: 0

    execute <<-SQL
      update levels set published = 1 where published is NULL
    SQL

    change_column_null :levels, :published, false
  end

  def down
    remove_column :levels, :published
  end
end
