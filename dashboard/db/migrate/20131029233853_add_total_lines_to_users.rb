class AddTotalLinesToUsers < ActiveRecord::Migration[4.2]
  def change
    add_column :users, :total_lines, :integer, null: false, default: 0
  end
end
