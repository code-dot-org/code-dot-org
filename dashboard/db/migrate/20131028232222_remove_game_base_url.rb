class RemoveGameBaseUrl < ActiveRecord::Migration[4.2]
  def change
    remove_column :games, :base_url
  end
end
