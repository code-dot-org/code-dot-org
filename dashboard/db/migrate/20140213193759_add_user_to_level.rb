class AddUserToLevel < ActiveRecord::Migration
  def change
    add_reference :levels, :user
  end
end
