class CreateSchoolDistricts < ActiveRecord::Migration[4.2]
  def change
    create_table :school_districts do |t|
      t.string :name
      t.string :city
      t.string :state
      t.string :zip

      t.timestamps null: false
    end
  end
end
