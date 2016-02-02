class CreateArtifactAssignments < ActiveRecord::Migration
  def change
    create_table :artifact_assignments do |t|
      t.references :artifact_submission, index: true, foreign_key: true
      t.references :artifact, index: true, foreign_key: true
      t.references :user, index: true, foreign_key: true
      t.string :status

      t.timestamps null: false
    end
  end
end
