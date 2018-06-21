class CreatePdInternationalOptins < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_international_optins do |t|
      t.references :user, index: true
      t.text :form_data
      t.timestamps null: false
    end
  end
end
