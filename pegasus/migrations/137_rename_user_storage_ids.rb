Sequel.migration do
  up do
    pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym
    dashboard_user_project_storage_ids = "#{CDO.dashboard_db_name}__user_project_storage_ids".to_sym

    unless [:production].include?(rack_env) || ENV['CI']

      # Rename the table to move it from the Pegasus schema to Dashboard
      # Also change the name from user_storage_ids to user_project_storage_ids
      rename_table(pegasus_user_storage_ids, dashboard_user_project_storage_ids)

      # This view exists as a safe-guard during the time between when the table rename is applied
      # And the code referencing the new name is deployed, during that time queries to the old table name
      # will hit this view and query from the renamed table
      create_view(pegasus_user_storage_ids, DB[dashboard_user_project_storage_ids].select_all)
    end

    # In Drone CI, the table will be created from from schema.rb file. After that, this migration
    # will get run, we can't do a table rename at that point because user_project_storage_ids will already
    # exist. So we just need to drop the old table and create the view for consistency between envs.
    if ENV['CI']
      drop_table(pegasus_user_storage_ids)
      create_view(pegasus_user_storage_ids, DB[dashboard_user_project_storage_ids].select_all)
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
