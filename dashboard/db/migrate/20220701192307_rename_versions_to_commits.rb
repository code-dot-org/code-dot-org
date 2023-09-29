class RenameVersionsToCommits < ActiveRecord::Migration[6.0]
  def up
    rename_table :project_versions, :project_commits

    execute <<-SQL.squish
      CREATE VIEW project_versions AS SELECT * from project_commits;
    SQL
  end

  def down
    execute <<-SQL.squish
      DROP VIEW project_versions;
    SQL

    rename_table :project_commits, :project_versions
  end
end
