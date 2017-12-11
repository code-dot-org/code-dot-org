class RenamePartialDiscount < ActiveRecord::Migration[5.0]
  def change
    rename_column :circuit_playground_discount_codes, :partial_discount, :full_discount
  end
end
