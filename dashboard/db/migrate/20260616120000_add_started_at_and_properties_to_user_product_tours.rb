class AddStartedAtAndPropertiesToUserProductTours < ActiveRecord::Migration[7.0]
  def change
    add_column :user_product_tours, :started_at, :datetime
    add_column :user_product_tours, :properties, :json
  end
end
