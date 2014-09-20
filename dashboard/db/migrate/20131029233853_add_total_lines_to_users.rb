class AddTotalLinesToUsers < ActiveRecord::Migration
  def change
    add_column :users, :total_lines, :integer, null:false, default:0
  end
end
