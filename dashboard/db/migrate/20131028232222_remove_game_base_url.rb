class RemoveGameBaseUrl < ActiveRecord::Migration
  def change
    remove_column :games, :base_url
  end
end
