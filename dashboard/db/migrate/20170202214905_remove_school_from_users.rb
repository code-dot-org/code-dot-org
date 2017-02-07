class RemoveSchoolFromUsers < ActiveRecord::Migration[5.0]
  def change
    remove_column :users, :school, :string
  end
end
