Sequel.migration do
  up do
    create_table?(:forms, charset: 'utf8') do
      primary_key :id, unsigned: true
      foreign_key :parent_id, index: true
      String :secret, size: 50, null: false, unique: true
      foreign_key :user_id, index: true
      String :email, null: false, index: true
      String :name, index: true
      String :kind, size: 50, null: false, index: true
      Text :data, null: false
      String :source_id, size: 50
      DateTime :created_at, index: true, null: false
      String :created_ip, size: 39, null: false
      DateTime :updated_at, index: true, null: false
      String :updated_ip, size: 39, null: false
      DateTime :processed_at, index: true
      Text :processed_data
      DateTime :notified_at, index: true
      DateTime :indexed_at, index: true
      String :review, size: 50
      DateTime :reviewed_at, index: true
      foreign_key :reviewed_by
      String :reviewed_ip, size: 39
    end
  end

  down do
    #drop_table? :forms
  end
end
