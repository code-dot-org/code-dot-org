class AddUserToScript < ActiveRecord::Migration[4.2]
  def change
    add_reference :scripts, :user
  end
end
