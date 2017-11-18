class CreateCircuitPlaygroundDiscountApplications < ActiveRecord::Migration[5.0]
  def change
    create_table :circuit_playground_discount_applications do |t|
      t.references :user, index: {unique: true}, null: false
      t.integer :unit_6_intention, null: true
      t.boolean :has_confirmed_school, null: false, default: false
      t.boolean :full_discount, null: true
      t.boolean :admin_set_status, null: false, default: false
      t.string :signature
      t.datetime :signed_at
      t.references :circuit_playground_discount_code, index: {name: 'index_circuit_playground_applications_on_code_id'}
      t.timestamps
    end
  end
end
