class AddGameIdToBackpacksAndBackfill < ActiveRecord::Migration[6.1]
  def change
    add_column :backpacks, :game_id, :integer, index: true

    reversible do |dir|
      dir.up do
        game_id = Game.find_by(name: 'Javalab')&.id
        if game_id
          Backpack.where(game_id: nil).update_all(game_id: game_id)
        else
          Rails.logger.warn "Game 'Javalab' not found. No backfill performed."
        end
      end
      dir.down do
        Backpack.update_all(game_id: nil)
      end
    end
  end
end
