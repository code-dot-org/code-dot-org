class AddUserToLevel < ActiveRecord::Migration[4.2]
  def change
    add_reference :levels, :user
  end
end
