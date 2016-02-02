class CreateUserArtifactAssignments < ActiveRecord::Migration
  def change
    create_table :user_artifact_assignments do |t|
      t.references :user, index: true, foreign_key: true
      t.references :artifact, index: true, foreign_key: true
      t.time :assigned_date
      t.time :completed_date
      t.string :status

      t.timestamps null: false
    end
  end
end
