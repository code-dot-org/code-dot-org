Sequel.migration do
  up do
    pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym
    dashboard_user_project_storage_ids = "#{CDO.dashboard_db_name}__user_project_storage_ids".to_sym

    unless [:production].include?(rack_env)

      begin
        # Rename the table to move it from the Pegasus schema to Dashboard
        # Also change the name from user_storage_ids to user_project_storage_ids
        rename_table(pegasus_user_storage_ids, dashboard_user_project_storage_ids)

        # This view exists as a safe-guard during the time between when the table rename is applied
        # And the code referencing the new name is deployed, during that time queries to the old table name
        # will hit this view and query from the renamed table
        create_view(pegasus_user_storage_ids, DB[dashboard_user_project_storage_ids].select_all)
      rescue Sequel::DatabaseError => e
        is_table_already_exists_error = e.message.include? "Table 'user_project_storage_ids' already exists"
        is_pegasus_table_empty = DB[pegasus_user_storage_ids].count == 0
        # When setting up environments from scratch, the new table will be created from the dashboard schema.rb
        # and there will be no previously existing user_storage_ids data, so the old pegasus table can be dropped.
        # The view will be created for consistency across environments.
        if is_table_already_exists_error && is_pegasus_table_empty
          puts "user_project_storage_ids has already been created, dropping pegasus user_storage_ids..."
          drop_table(pegasus_user_storage_ids)
          create_view(pegasus_user_storage_ids, DB[dashboard_user_project_storage_ids].select_all)
        else
          raise e
        end
      end
    end
  end

  down do
    unless [:production].include?(rack_env)
      pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym
      dashboard_user_project_storage_ids = "#{CDO.dashboard_db_name}__user_project_storage_ids".to_sym
      drop_view(pegasus_user_storage_ids)
      rename_table(dashboard_user_project_storage_ids, pegasus_user_storage_ids)
    end
  end
end
