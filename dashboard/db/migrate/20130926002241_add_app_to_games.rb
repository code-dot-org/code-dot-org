class AddAppToGames < ActiveRecord::Migration[4.2]
  def change
    add_column :games, :app, :string
  end
end
