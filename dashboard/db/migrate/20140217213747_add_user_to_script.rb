class AddUserToScript < ActiveRecord::Migration
  def change
    add_reference :scripts, :user
  end
end
