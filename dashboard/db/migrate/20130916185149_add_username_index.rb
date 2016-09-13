class AddUsernameIndex < ActiveRecord::Migration[4.2]
  def change
    add_index(:users, :username, unique: true)
  end
end
