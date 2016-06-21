Sequel.migration do
  up do
    if [:staging, :adhoc, :test, :production].include?(rack_env)
      # This data lives in DynamoDB in these environments.
      from(:app_properties).delete
      from(:app_tables).delete
    end
  end

  down do
  end
end
