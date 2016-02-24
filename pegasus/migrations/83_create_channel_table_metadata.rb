Sequel.migration do
  up do
    # TODO - app_id -> channel_id in apps_table

    create_table?(:channel_table_metadata, charset: 'utf8') do
      primary_key :id, unsigned: true, null: false
      foreign_key :channel_id, index: true, null: false
      String :table_type, size: 50, index: true, null: false
      String :table_name, size: 50, index: true, null: false

      Text :column_info

      DateTime :updated_at, null: false

      index [:channel_id,:table_name,:table_type], unique: true
    end
  end

  down do
    drop_table?(:channel_table_metadata)
  end
end
