class AddOwnerToScripts < ActiveRecord::Migration[5.0]
  def change
    add_column :scripts, :owner_id, :integer
  end
end
