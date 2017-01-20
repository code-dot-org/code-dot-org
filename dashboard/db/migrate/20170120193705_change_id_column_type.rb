class ChangeIdColumnType < ActiveRecord::Migration[5.0]
  def change
    change_column :activities, :id, :bigint
  end
end
