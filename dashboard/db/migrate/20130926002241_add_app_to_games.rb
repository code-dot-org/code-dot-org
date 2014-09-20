class AddAppToGames < ActiveRecord::Migration
  def change
    add_column :games, :app, :string
  end
end
