class DropCircuitPlaygroundApplicationAndCodeTable < ActiveRecord::Migration[6.1]
  def change
    drop_table :circuit_playground_discount_applications if ActiveRecord::Base.connection.table_exists? :circuit_playground_discount_applications
    drop_table :circuit_playground_discount_codes if ActiveRecord::Base.connection.table_exists? :circuit_playground_discount_codes
  end
end
