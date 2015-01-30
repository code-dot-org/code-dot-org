Sequel.migration do
  up do
    create_table?(:users, charset:'utf8') do
      primary_key :id, null:false
      String :email, size:255, unique:true, null:false

      Text :google_oauth2
      String :pivotal_token, size:255

      DateTime :updated_at, null:false
      String :updated_ip, size:39, null:false
    end
  end

  down do
    drop_table?(:users) unless rack_env?(:production)
  end
end
