class MakeUserProductToursCompletedAtNullable < ActiveRecord::Migration[7.0]
  def change
    change_column_null :user_product_tours, :completed_at, true
  end
end
