class CreateJSONVideoObjectives < ActiveRecord::Migration[7.0]
  def change
    create_table :json_video_objectives, id: false do |t|
      t.bigint :json_video_id, null: false
      t.integer :objective_id, null: false
    end

    add_index :json_video_objectives, [:json_video_id, :objective_id], unique: true
    add_index :json_video_objectives, :objective_id
  end
end
