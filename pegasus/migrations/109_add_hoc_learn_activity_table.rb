Sequel.migration do
  change do
    create_table(:hoc_learn_activity, charset: 'utf8') do
      primary_key :id
      DateTime :created_at, index: true
      DateTime :updated_at, index: true
      String :session, index: true, size: 50
      String :referer, size: 50
      String :tutorial, index: true, null: false, size: 50
    end
  end
end
