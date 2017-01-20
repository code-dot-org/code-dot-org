class ChangeIdColumnType < ActiveRecord::Migration[5.0]
  def up
    change_column :activities, :id, :bigint
  end

  def down
    change_column :activities, :id, :integer
  end
end
