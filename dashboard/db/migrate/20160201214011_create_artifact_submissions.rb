class CreateArtifactSubmissions < ActiveRecord::Migration
  def change
    create_table :artifact_submissions do |t|
      t.string :type

      t.timestamps null: false
    end
  end
end
