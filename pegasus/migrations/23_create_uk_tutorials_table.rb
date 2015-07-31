Sequel.migration do
  up do
    drop_table?(:uk_hoc_tutorials) # Drop DataMapper version of the table if still around.

    create_table(:uk_tutorials, charset: 'utf8') do
      primary_key :id
      String :code, index: true, null: false, unique: true
      String :short_code, index: true, null: false, unique: true
      Integer :displayweight, null: false
      String :name, null: false
      String :orgname, null: false
      String :contact
      String :url, size: 2000, null: false
      String :shortdescription, null: false
      Text :longdescription, null: false
      String :platformtext, null: false
      String :gradelevel, null: false
      String :image, null: false
      String :tags, null: false
      String :teachers_notes
      String :language
      String :languages_supported
    end
  end

  down do
    drop_table(:uk_tutorials)
  end
end
