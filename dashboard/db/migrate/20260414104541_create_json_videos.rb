class CreateJSONVideos < ActiveRecord::Migration[7.0]
  def change
    create_table :json_videos do |t|
      t.string :key, null: false
      t.string :description
      t.string :s3_uri, null: false
      t.string :lab
      t.integer :version, null: false
      t.string :audience, null: false

      t.timestamps
    end

    add_index :json_videos, :key, unique: true
  end
end
