class AddSchoolToCircuitPlaygroundDiscountApplication < ActiveRecord::Migration[5.0]
  def change
    remove_column :circuit_playground_discount_applications, :has_confirmed_school, :boolean
    add_reference :circuit_playground_discount_applications, :school, foreign_key: true, type: :string
  end
end
