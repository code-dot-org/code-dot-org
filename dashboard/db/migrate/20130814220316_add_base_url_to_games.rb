class AddBaseUrlToGames < ActiveRecord::Migration[4.2]
  def change
    add_column :games, :base_url, :string
    add_column :levels, :level_num, :integer
  end
end
