class DropProjectVersionsView < ActiveRecord::Migration[6.0]
  def up
    execute <<-SQL.squish
      DROP VIEW project_versions;
    SQL
  end

  def down
    execute <<-SQL.squish
      CREATE VIEW project_versions AS SELECT * from project_commits;
    SQL
  end
end
