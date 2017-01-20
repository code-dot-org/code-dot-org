class ChangeIdColumnType < ActiveRecord::Migration[5.0]
  def up
    change_column :activities, :id, :bigint, auto_increment: true
  end

  def down
    change_column :activities, :id, :integer, auto_increment: true
  end
end
