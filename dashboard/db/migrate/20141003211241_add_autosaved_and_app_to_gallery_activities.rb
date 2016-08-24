class AddAutosavedAndAppToGalleryActivities < ActiveRecord::Migration[4.2]
  def change
    add_column :gallery_activities, :autosaved, :boolean
    add_column :gallery_activities, :app, :string, null: false, default: Game::ARTIST

    add_index :gallery_activities, [:app, :autosaved]
  end
end
