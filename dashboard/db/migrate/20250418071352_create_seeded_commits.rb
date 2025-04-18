class CreateSeededCommits < ActiveRecord::Migration[6.1]
  def change
    create_table :seeded_commits do |t|
      t.string :commit_hash, null: false
      t.integer :status, default: SeededCommit.statuses[:not_started]

      t.timestamps
    end
    add_index :seeded_commits, :commit_hash, unique: true
    add_index :seeded_commits, :updated_at
  end
end
