Sequel.migration do
  up do
    create_table?(:user_storage_ids, charset: 'utf8') do
      primary_key :id, unsigned: true, null: false
      foreign_key :user_id, index: true, unique: true
    end
  end

  down do
    drop_table?(:user_storage_ids) unless rack_env?(:production)
  end
end
