# Convert data JSON columns to native JSON data type for optimized performance and storage.
Sequel.migration do
  up do
    # Native JSON data type requires MySQL 5.7.8.
    unless database_type == :mysql
      raise "MySQL database is required for JSON data type.
You are currently using #{database_type}.
Set up a MySQL database and retry the migration."
    end

    unless server_version >= 50708
      raise "MySQL 5.7.8 (50708) or greater is required for JSON data type.
You are currently using version #{server_version}.
Upgrade your MySQL server and retry the migration."
    end

    alter_table(:forms) do
      set_column_type :data, :JSON
      set_column_type :processed_data, :JSON
    end
  end

  down do
    alter_table(:forms) do
      set_column_type :processed_data, :Text
      set_column_type :data, :Text
    end
  end
end
