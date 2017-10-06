class CreatePdApplications < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_applications do |t|
      t.string :type, null: false, index: true
      t.string :application_year, null: false, index: true
      t.string :application_type, null: false, index: true
      t.references :regional_partner, index: true
      t.string :status, index: true, null: false
      t.datetime :locked_at
      t.text :notes
      t.text :form_data, null: false
      t.timestamps
    end
  end
end
