require 'cdo/redshift'
require 'pg'

class RedshiftImport
  # Database Migration Service Replication Tasks load data from Aurora into staging Redshift tables with a prefix.
  TEMP_TABLE_PREFIX = '_import_'.freeze
  BACKUP_TABLE_PREFIX = '_old_'.freeze

  # DMS Replication Tasks import data from the production MySQL database into temporary / staging tables prefixed with
  # "_import_" to avoid disrupting usage of the Analytics/Reporting solutions during the lengthy Full Load process.
  # Complete import of staged data by renaming the current table to "_old_", renaming the staging table, and then
  # dropping the old table.
  # @param schemas [String] Array of Redshift schemas in which to complete data import.
  def self.complete_table_import(schemas)
    schemas.each do |schema|
      temporary_import_tables(schema).each do |import_table|
        target_table = import_table.partition(TEMP_TABLE_PREFIX).last
        backup_table = BACKUP_TABLE_PREFIX + target_table

        # Rename existing table to back it up, if it exists.
        begin
          rename_table(schema, target_table, backup_table)
        rescue PG::UndefinedTable => undefined_table_error
          # When a new table created in the source MySQL database is imported for the first time, there won't be an
          # existing table in Redshift to backup.
          CDO.log.info "Unable to back up table #{schema}.#{target_table} because it does not exist. #{undefined_table_error}"
        end

        # Make staging table the production table.
        rename_table(schema, import_table, target_table)

        # Rename the primary key from '_import_[foo]_primary' to '[foo]_primary' so that the next time the
        # DMS Replication Task runs and creates the staging table it can create the primary key without being blocked
        # by an existing primary key with that name.
        # Also rename the backup table's primary key.
        old_primary_key = RedshiftImport.primary_key(schema, backup_table)
        if old_primary_key
          rename_primary_key(
            schema,
            backup_table,
            old_primary_key[:name],
            BACKUP_TABLE_PREFIX + old_primary_key[:name],
            old_primary_key[:columns]
          )
        end

        primary_key = RedshiftImport.primary_key(schema, target_table)
        if primary_key
          rename_primary_key(
            schema,
            target_table,
            primary_key[:name],
            primary_key[:name].partition(TEMP_TABLE_PREFIX).last,
            primary_key[:columns]
          )
        end

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

  # Get name and columns of primary key constraint for a specific table, if constraint exists.
  # @param schema [String] Redshift schema.
  # @param table [String] The Redshift table.
  # Returns hash containing name of primary key and an array of the column names it constrains.
  def self.primary_key(schema, table)
    redshift_client = RedshiftClient.instance
    primary_key_query = <<~SQL
      SELECT co.conname AS constraint_name
        ,    co.conkey AS constraint_column_ids
      FROM   pg_catalog.pg_tables t
        INNER JOIN pg_catalog.pg_class cl ON (cl.relname = t.tablename AND cl.relkind = 'r') -- relkind 'r' is an ordinary table
        INNER JOIN pg_catalog.pg_constraint co ON (co.conrelid = cl.oid AND co.contype = 'p') -- contype 'p' is primary key
        INNER JOIN pg_catalog.pg_namespace n ON cl.relnamespace = n.oid
      WHERE  t.schemaname = '#{schema}'
        AND  t.tablename = '#{table}'
        AND  n.nspname = '#{schema}';
    SQL
    result = redshift_client.exec(primary_key_query)
    return nil if result.ntuples == 0

    # This is a comma delimited list enclosed in curly braces, cast to string from the an integer array datatype.
    # Example: "{1}" or "{2,1}"
    constraint_column_ids_list = result[0]['constraint_column_ids']

    # Strip the curly braces off.
    constraint_column_ids_list.slice!("\{")
    constraint_column_ids_list.slice!("\}")

    # Get the names of the columns that a primary key is composed of.
    column_query = <<~SQL
      SELECT a.attname AS column_name
      FROM   pg_catalog.pg_tables t
        INNER JOIN pg_catalog.pg_class cl ON (cl.relname = t.tablename AND cl.relkind = 'r') --  'r' is a table
        INNER JOIN pg_catalog.pg_constraint co ON (co.conrelid = cl.oid AND co.contype = 'p') -- 'p' is primary key
        INNER JOIN pg_catalog.pg_attribute a ON cl.oid = a.attrelid
        INNER JOIN pg_catalog.pg_namespace n ON cl.relnamespace = n.oid
      WHERE  t.schemaname = '#{schema}'
        AND  t.tablename = '#{table}'
        AND  n.nspname = '#{schema}'
        AND  a.attnum IN (#{constraint_column_ids_list});
    SQL
    primary_key_column_names = redshift_client.exec(column_query).map {|row| row['column_name']}
    key = {
      name: result[0]['constraint_name'],
      columns: primary_key_column_names
    }
    return key if result.ntuples == 1
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

  # Get name and columns of primary key constraint for a specific table, if constraint exists.
  # @param schema [String] Redshift schema that contains the table.
  # @param table [String] Redshift table that has the primary key constraint.
  # @param current_index_name [String] Current name of primary key.
  # @param new_index_name [String] New primary key name.
  # @param columns [Array] Array of column names that primary key is composed of.
  # Returns PG:Result (https://github.com/ged/ruby-pg/blob/master/lib/pg/result.rb).
  def self.rename_primary_key(schema, table, current_index_name, new_index_name, columns)
    redshift_client = RedshiftClient.instance
    query = <<~SQL
      SET search_path TO #{schema};
      BEGIN;
      ALTER TABLE #{table} DROP CONSTRAINT #{current_index_name};
      ALTER TABLE #{table} ADD CONSTRAINT #{new_index_name} PRIMARY KEY (#{columns.join(',')});
      COMMIT;
    SQL
    redshift_client.exec(query)
  end
end
