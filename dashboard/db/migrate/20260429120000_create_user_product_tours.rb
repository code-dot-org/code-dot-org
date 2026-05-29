class CreateUserProductTours < ActiveRecord::Migration[7.0]
  def change
    create_table :user_product_tours do |t|
      t.integer :user_id, null: false
      t.string :tour_name, null: false
      t.datetime :completed_at, null: false
    end

    add_index :user_product_tours, [:user_id, :tour_name], unique: true
  end
end
