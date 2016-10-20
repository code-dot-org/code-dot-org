class CreateSchools < ActiveRecord::Migration[5.0]
  def change
    survey_year_comment = 'The survey year from which the data for this school was obtained. '\
      'This will usually be the current survey year. However, if a school is removed '\
      'from the list between one survey and the next, then it will appear in this table with '\
      'a non-current survey year.'
    create_table :schools, :id => false do |t|
      t.integer :id, limit: 8, comment: 'NCES public school ID'
      t.references :school_district, foreign_key: true
      t.string :name
      t.string :school_type
      t.integer :survey_year, comment: survey_year_comment
      t.timestamps
    end
  end
end
