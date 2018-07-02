# Add JSON generated column with secondary index for country-code attribute to improve query performance.
Sequel.migration do
  up do
    # Generated column feature required for this migration.
    unless database_type == :mysql &&
      supports_generated_columns? &&
      server_version >= 50713
      raise "MySQL JSON functions and generated column features required.
You are currently using #{database_type} version #{server_version}.
Upgrade your MySQL server to >= 5.7.13 and retry the migration."
    end

    alter_table(:forms) do
      add_column :location_country_code_s,
        String, size: 2, fixed: true,
        generated_always_as: Sequel.lit('processed_data->>"$.location_country_code_s"')
      add_index [:kind, :location_country_code_s]
    end
  end

  down do
    alter_table(:forms) do
      drop_index [:kind, :location_country_code_s]
      drop_column :location_country_code_s
    end
  end
end
