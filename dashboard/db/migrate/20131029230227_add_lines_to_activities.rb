class AddLinesToActivities < ActiveRecord::Migration
  def change
    add_column :activities, :lines, :integer, null:false, default:0
  end
end
