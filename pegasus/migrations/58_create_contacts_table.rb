Sequel.migration do
  up do
    create_table?(:contacts, charset: 'utf8') do
      primary_key :id
      String :email, size: 254, index: true, unique: true, null: false
      String :name, size: 255
      DateTime :created_at, null: false
      Date :created_on, null: false
      String :created_ip, size: 39, null: false
      DateTime :unsubscribed_at
      Date :unsubscribed_on, index: true
      String :unsubscribed_ip, size: 39
      DateTime :updated_at, null: false
      Date :updated_on, null: false
      String :updated_ip, size: 39, null: false
    end
  end

  down do
    drop_table(:contacts)
  end
end
