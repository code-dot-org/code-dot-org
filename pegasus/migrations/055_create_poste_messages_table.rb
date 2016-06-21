Sequel.migration do
  up do
    create_table?(:poste_messages, charset: 'utf8') do
      primary_key :id
      String :name, size: 50, null: false, unique: true, index: true
    end
  end

  down do
    drop_table(:poste_messages)
  end
end
