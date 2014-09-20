class CreateGalleryActivities < ActiveRecord::Migration
  def change
    create_table :gallery_activities do |t|
      t.integer :user_id, null: false
      t.integer :activity_id, null: false

      t.timestamps
    end

    add_index :gallery_activities, [:user_id, :activity_id], unique: true
  end
end
