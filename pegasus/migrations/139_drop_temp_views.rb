Sequel.migration do
  up do
    pegasus_storage_apps = "#{CDO.pegasus_db_name}__storage_apps".to_sym
    pegasus_user_storage_ids = "#{CDO.pegasus_db_name}__user_storage_ids".to_sym

    unless [:production].include?(rack_env)
      begin
        DB.drop_view(pegasus_storage_apps)
      rescue Sequel::DatabaseError => e
        is_unknown_table_error = e.message.include? "Unknown table"
        if is_unknown_table_error
          CDO.log.warn "Temporary view for storage apps doesn't exist"
        else
          raise e
        end
      end

      begin
        DB.drop_view(pegasus_user_storage_ids)
      rescue Sequel::DatabaseError => e
        is_unknown_table_error = e.message.include? "Unknown table"
        if is_unknown_table_error
          CDO.log.warn "Temporary view for user_storage_ids doesn't exist"
        else
          raise e
        end
      end
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
