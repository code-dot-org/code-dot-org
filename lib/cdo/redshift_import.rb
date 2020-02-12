require 'cdo/redshift'

class RedshiftImport
  # Database Migration Service Replication Tasks load data from Aurora into staging Redshift tables with a prefix.
  TEMP_TABLE_PREFIX = '_import_'.freeze

  # DMS Replication Tasks import data into temporary / staging tables prefixed with "_import_".
  # Complete import of staged data from production database into Redshift by truncating each
  # target table, moving all of the rows from each import table to its corresponding target table, and then dropping
  # each temporary / staging import table.
  # @param schemas [String] Array of Redshift schemas in which to complete data import.
  def self.complete_table_import(schemas)
    schemas.each do |schema|
      temporary_import_tables(schema).each do |import_table|
        target_table = import_table.partition(TEMP_TABLE_PREFIX).last
        truncate_table(schema, target_table)
        move_rows(schema, import_table, schema, target_table)
        drop_table(schema, import_table)
      end
    end
  end

  private

  # Get names of tables in a Redshift schema that were loaded via DMS to stage imported data from the database.
  # @param schema [String] The Redshift schema to search for database import staging tables.
  # Returns Array of Redshift table names.
  def temporary_import_tables(schema)
    query = <<-SQL
SET search_path TO #{schema};

SELECT DISTINCT t.tablename
FROM pg_table_def t LEFT JOIN pg_indexes i ON t.tablename = i.indexname
WHERE  i.indexname IS NULL -- Don't count primary keys, which appear in pg_table_def, as a table.
  AND  t.schemaname ='#{schema}'
  AND t.tablename LIKE '#{TEMP_TABLE_PREFIX}%';
SQL
    exec(query).map {|row| row['tablename']}
  end

  def truncate_table(schema, table)
    exec "TRUNCATE #{schema}.#{table};"
  end

  def drop_table(schema, table)
    exec "DROP TABLE IF EXISTS #{schema}.#{table};"
  end

  def move_rows(source_schema, source_table, target_schema, target_table)
    exec "ALTER TABLE #{target_schema}.#{target_table} APPEND FROM #{source_schema}.#{source_table};"
  end
end
