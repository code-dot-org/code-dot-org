class CreatePdInternationalOptIns < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_international_opt_ins do |t|
      t.references :user, index: true, null: false
      t.text :form_data, null: false
      t.timestamps null: false
    end
  end
end
