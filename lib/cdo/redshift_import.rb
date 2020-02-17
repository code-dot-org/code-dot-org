require 'cdo/redshift'

class RedshiftImport
  # Database Migration Service Replication Tasks load data from Aurora into staging Redshift tables with a prefix.
  TEMP_TABLE_PREFIX = '_import_'.freeze
  BACKUP_TABLE_PREFIX = '_old_'.freeze

  # DMS Replication Tasks import data into temporary / staging tables prefixed with "_import_".
  # Complete import of staged data from production database into Redshift by truncating each
  # target table, moving all of the rows from each import table to its corresponding target table, and then dropping
  # each temporary / staging import table.
  # @param schemas [String] Array of Redshift schemas in which to complete data import.
  def self.complete_table_import(schemas)
    schemas.each do |schema|
      temporary_import_tables(schema).each do |import_table|
        target_table = import_table.partition(TEMP_TABLE_PREFIX).last
        backup_table = BACKUP_TABLE_PREFIX + target_table

        # Rename existing table to back it up.
        rename_table(schema, target_table, backup_table)

        # Make staging table the production table.
        rename_table(schema, import_table, target_table)

        # Rename the primary key from '_import_[foo]_primary' to '[foo]_primary' so that the next time the
        # DMS Replication Task runs and creates the staging table it can create the primary key with a matching name.
        backup_primary_key = RedshiftImport.primary_key(schema, backup_table)
        rename_index(schema, backup_table, backup_primary_key, BACKUP_TABLE_PREFIX + backup_primary_key) if backup_primary_key
        primary_key = RedshiftImport.primary_key(schema, target_table)
        rename_index(schema, target_table, primary_key, primary_key.partition(TEMP_TABLE_PREFIX).last) if primary_key

        # Drop the old production table.
        drop_table(schema, backup_table)
      end
    end
  end

  # Get names of tables in a Redshift schema that were loaded via DMS to stage imported data from the database.
  # @param schema [String] The Redshift schema to search for database import staging tables.
  # Returns Array of Redshift table names.
  def self.temporary_import_tables(schema)
    redshift_client = RedshiftClient.instance
    query = <<~SQL
      SET search_path TO #{schema};
      SELECT DISTINCT t.tablename
      FROM pg_table_def t LEFT JOIN pg_indexes i ON t.tablename = i.indexname
      WHERE  i.indexname IS NULL -- Don't count primary keys, which appear in pg_table_def, as a table.
        AND  t.schemaname ='#{schema}'
        AND t.tablename LIKE '#{TEMP_TABLE_PREFIX}%';
    SQL
    redshift_client.exec(query).map {|row| row['tablename']}
  end

  # Get name of primary key constraint for a specific table, if constraint exists.
  # @param schema [String] Redshift schema.
  # @param table [String] The Redshift table.
  # Returns Name of primary key constraint on the specified table, if it exists, otherwise nil.
  def self.primary_key(schema, table)
    redshift_client = RedshiftClient.instance
    query = <<~SQL
      SELECT constraint_name
      FROm information_schema.table_constraints
      WHERE constraint_schema = '#{schema}'
        AND table_name = '#{table}'
        AND constraint_type = 'PRIMARY KEY';
    SQL
    result = redshift_client.exec(query)
    return nil if result.ntuples == 0
    return result[0]['constraint_name'] if result.ntuples == 1
    raise StandardError.new "Error getting primary key constraint for specified table.  More than 1 result returned."
  end

  def self.truncate_table(schema, table)
    redshift_client = RedshiftClient.instance
    redshift_client.exec "TRUNCATE #{schema}.#{table};"
  end

  def self.drop_table(schema, table)
    redshift_client = RedshiftClient.instance
    redshift_client.exec "DROP TABLE IF EXISTS #{schema}.#{table};"
  end

  # Rename a table within the same schema to preserve permissions.
  def self.rename_table(schema, current_table_name, new_table_name)
    redshift_client = RedshiftClient.instance
    query = <<~SQL
      SET search_path TO #{schema};
      ALTER TABLE #{current_table_name} RENAME TO #{new_table_name};
    SQL
    redshift_client.exec(query)
  end

  # TODO: (suresh) Fix name of method, and stop hard coding column name.
  def self.rename_index(schema, table, current_index_name, new_index_name)
    redshift_client = RedshiftClient.instance
    query = <<~SQL
      SET search_path TO #{schema};
      BEGIN;
      ALTER TABLE #{table} DROP CONSTRAINT #{current_index_name};
      ALTER TABLE #{table} ADD CONSTRAINT #{new_index_name} PRIMARY KEY (id);
      COMMIT;
    SQL
    redshift_client.exec(query)
  end
end
