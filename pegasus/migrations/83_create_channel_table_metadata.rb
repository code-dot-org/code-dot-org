Sequel.migration do
  up do
    # TODO - app_id -> channel_id

    create_table?(:channel_table_metadata, charset: 'utf8') do
      primary_key :id, unsigned: true, null: false
      foreign_key :app_id, index: true, null: false
      foreign_key :storage_id, index: true
      String :table_name, size: 50, index: true, null: false

      Text :column_list

      DateTime :updated_at, null: false

      index [:channel_id,:storage_id,:table_name], unique: true
    end
  end

  down do
    drop_table?(:channel_table_metadata)
  end
end
