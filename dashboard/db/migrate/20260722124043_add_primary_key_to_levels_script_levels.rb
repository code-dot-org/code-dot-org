class AddPrimaryKeyToLevelsScriptLevels < ActiveRecord::Migration[7.0]
  # Promote existing UNIQUE index on (script_level_id, level_id) to a composite PRIMARY KEY so the table can be
  # replicated by Zero ETL, which requires a database-level primary key.
  def up
    execute <<~SQL.squish
      ALTER TABLE levels_script_levels
        ADD PRIMARY KEY (script_level_id, level_id),
        DROP INDEX index_levels_script_levels_on_script_level_id_and_level_id
    SQL
  end

  def down
    execute <<~SQL.squish
      ALTER TABLE levels_script_levels
        DROP PRIMARY KEY,
        ADD UNIQUE INDEX index_levels_script_levels_on_script_level_id_and_level_id (script_level_id, level_id)
    SQL
  end
end
