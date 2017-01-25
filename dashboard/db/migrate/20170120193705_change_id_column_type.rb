class ChangeIdColumnType < ActiveRecord::Migration[5.0]
  def up
    change_column :activities, :id, :bigint, auto_increment: true
  end

  def down
    # Disabled because this could cause data loss if items with bigint ids are stored already
    # change_column :activities, :id, :integer, auto_increment: true
  end
end
