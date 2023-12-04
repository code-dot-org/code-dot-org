class DropCircuitPlaygroundDiscountApplicationTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :circuit_playground_discount_applications if ActiveRecord::Base.connection.table_exists? :circuit_playground_discount_applications
  end
end
