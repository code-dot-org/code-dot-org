class AddLinesToActivities < ActiveRecord::Migration[4.2]
  def change
    add_column :activities, :lines, :integer, null: false, default: 0
  end
end
