class CreateSeededS3Objects < ActiveRecord::Migration[5.0]
  def change
    create_table :seeded_s3_objects do |t|
      t.string :bucket
      t.string :key
      t.string :etag

      t.timestamps
    end

    add_index :seeded_s3_objects, [:bucket, :key, :etag]
  end
end
