class AddSeveralFieldsToUsers < ActiveRecord::Migration
  def change
    add_column :users, :gender, :string, limit: 1
    add_column :users, :name, :string
    add_column :users, :language, :string, limit: 2
  end
end
