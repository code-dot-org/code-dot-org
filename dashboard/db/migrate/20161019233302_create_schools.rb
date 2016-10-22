class CreateSchools < ActiveRecord::Migration[5.0]
  def change
    create_table :schools, id: false do |t|
      t.integer :id, limit: 8, null: false, comment: 'NCES public school ID'
      t.references :school_district, foreign_key: true, null: false
      t.string :name, null: false
      t.string :city, null: false
      t.string :state, null: false
      t.string :zip, null: false
      t.string :school_type, null: false
      t.timestamps null: false
    end
  end
end
