Sequel.migration do
  up do
    create_table?(:poste_opens, charset: 'utf8') do
      primary_key :id
      DateTime :created_at, null: false
      String :created_ip, size: 39, null: false
      foreign_key :delivery_id, null: false, index: true
    end
  end

  down do
    drop_table(:poste_opens)
  end
end
