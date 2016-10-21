class CreateSchools < ActiveRecord::Migration[5.0]
  def change
    create_table :schools, :id => false do |t|
      t.integer :id, limit: 8, comment: 'NCES public school ID'
      t.references :school_district, foreign_key: true
      t.string :name
      t.string :school_type
      t.timestamps
    end
  end
end
