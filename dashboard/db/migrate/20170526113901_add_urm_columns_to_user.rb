class AddUrmColumnsToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :urm, :boolean, default: nil
    add_column :users, :races, :string, default: nil
  end
end
