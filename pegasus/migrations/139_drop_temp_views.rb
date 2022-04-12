Sequel.migration do
  up do
    pegasus_storage_apps = "#{CDO.pegasus_db_name}__storage_apps".to_sym
    pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym

    unless [:production].include?(rack_env)
      DB.drop_view(pegasus_storage_apps)
      DB.drop_view(pegasus_user_storage_ids)
    end
  end

  down do
    pegasus_storage_apps = "#{CDO.pegasus_db_name}__storage_apps".to_sym
    pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym
    dashboard_projects = "#{CDO.dashboard_db_name}__projects".to_sym
    dashboard_user_project_storage_ids = "#{CDO.dashboard_db_name}__user_project_storage_ids".to_sym

    unless [:production].include?(rack_env)
      create_view(pegasus_storage_apps, DB[dashboard_projects].select_all)
      create_view(pegasus_user_storage_ids, DB[dashboard_user_project_storage_ids].select_all)
    end
  end
end
