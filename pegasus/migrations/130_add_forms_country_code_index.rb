# Add JSON generated column with secondary index for country-code attribute to improve query performance.
Sequel.migration do
  up do
    # Generated column feature required for this migration.
    unless database_type == :mysql && supports_generated_columns?
      raise "MySQL JSON functions and generated column features required.
You are currently using #{database_type} version #{server_version}.
Upgrade your MySQL server to a version which supports these features and retry the migration."
    end

    alter_table(:forms) do
      add_column :location_country_code_s,
        String, size: 2, fixed: true,
        # According to: https://dev.mysql.com/doc/refman/5.7/en/json-search-functions.html#operator_json-inline-path
        # processed_data->>"$.location_country_code_s")
        # is equivalent to
        # JSON_UNQUOTE(JSON_EXTRACT(processed_data, "$.location_country_code_s"))
        #
        # But the latter works on both mysql AND mariadb
        # mariadb does not plan to support mysql's json operators
        generated_always_as: Sequel.lit('JSON_UNQUOTE(JSON_EXTRACT(processed_data, "$.location_country_code_s"))')
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
