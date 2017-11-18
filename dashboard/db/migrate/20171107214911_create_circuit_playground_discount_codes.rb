class CreateCircuitPlaygroundDiscountCodes < ActiveRecord::Migration[5.0]
  def change
    create_table :circuit_playground_discount_codes do |t|
      t.string :code, null: false, unique: true
      t.boolean :partial_discount, null: false
      t.datetime :expiration, null: false
      t.datetime :claimed_at
      t.datetime :voided_at
      t.timestamps
    end
  end
end
