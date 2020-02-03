class CreateDonorSchools < ActiveRecord::Migration[5.0]
  def change
    create_table :donor_schools do |t|
      t.string :name
      t.string :nces_id

      t.timestamps
    end
  end
end
