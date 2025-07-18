class AddOrganizationToUsers < ActiveRecord::Migration[6.1]
  def change
    add_reference :users, :organization, null: true, foreign_key: true
  end
end
