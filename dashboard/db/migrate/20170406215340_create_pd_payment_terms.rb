class CreatePdPaymentTerms < ActiveRecord::Migration[5.0]
  def change
    create_table :pd_payment_terms do |t|
      t.references :regional_partner, foreign_key: true
      t.date :start_date, null: false
      t.date :end_date
      t.string :course
      t.string :subject
      t.text :properties

      t.timestamps
    end
  end
end
