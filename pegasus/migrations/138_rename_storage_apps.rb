Sequel.migration do
  up do
    pegasus_storage_apps = "#{CDO.pegasus_db_name}__storage_apps".to_sym
    dashboard_projects = "#{CDO.dashboard_db_name}__projects".to_sym

    unless [:production].include?(rack_env)
      begin
        # Rename the table to move it from the Pegasus schema to Dashboard
        # Also change the name from storage_apps to projects
        rename_table(pegasus_storage_apps, dashboard_projects)

        # This view exists as a safe-guard during the time between when the table rename is applied
        # And the code referencing the new name is deployed, during that time queries to the old table name
        # will hit this view and query from the renamed table
        create_view(pegasus_storage_apps, DB[dashboard_projects].select_all)
      rescue Sequel::DatabaseError => e
        is_table_already_exists_error = e.message.include? "Table 'projects' already exists"
        is_pegasus_table_empty = DB[pegasus_storage_apps].count == 0
        # When setting up environments from scratch, the new table will be created from the dashboard schema.rb
        # and there will be no previously existing storage_apps data, so the old pegasus table can be dropped.
        # The view will be created for consistency across environments.
        if is_table_already_exists_error && is_pegasus_table_empty
          CDO.log.warn "projects has already been created, dropping pegasus storage_apps..."
          drop_table(pegasus_storage_apps)
          create_view(pegasus_storage_apps, DB[dashboard_projects].select_all)
        else
          raise e
        end
      end
    end
  end

  down do
    unless [:production].include?(rack_env)
      pegasus_storage_apps = "#{CDO.pegasus_db_name}__storage_apps".to_sym
      dashboard_projects = "#{CDO.dashboard_db_name}__projects".to_sym
      drop_view(pegasus_storage_apps)
      rename_table(dashboard_projects, pegasus_storage_apps)
    end
  end
end
