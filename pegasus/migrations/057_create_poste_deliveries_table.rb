Sequel.migration do
  up do
    create_table?(:poste_deliveries, charset: 'utf8') do
      primary_key :id
      foreign_key :message_id, null: false, index: true
      Text :params, null: false
      DateTime :created_at, null: false
      String :created_ip, size: 39, null: false
      DateTime :sent_at
      foreign_key :contact_id, null: false, index: true
      String :contact_email, size: 254, null: false
    end
  end

  down do
    drop_table(:poste_deliveries)
  end
end
