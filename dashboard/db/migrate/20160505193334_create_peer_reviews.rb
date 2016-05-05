class CreatePeerReviews < ActiveRecord::Migration
  def change
    create_table :peer_reviews do |t|
      t.references :user, index: true, foreign_key: true
      t.boolean :from_instructor, null: false, default: false
      t.references :script, index: true, foreign_key: true, null: false
      t.references :level, index: true, foreign_key: true, null: false
      t.references :level_source, index: true, foreign_key: true, null: false
      t.text :data
      t.integer :status

      t.timestamps null: false
    end
  end
end
