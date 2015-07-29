Sequel.migration do
  up do
    create_table?(:storage_apps, charset: 'utf8') do
      primary_key :id, unsigned: true, null: false
      foreign_key :storage_id, index: true
      Text :value

      DateTime :updated_at, null: false
      String :updated_ip, size: 39, null: false
    end
  end

  down do
    drop_table?(:storage_apps) unless rack_env?(:production)
  end
end
